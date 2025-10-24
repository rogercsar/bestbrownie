import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Usa service role se existir; caso contrário, anon (protótipo)
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BUCKET = "products"; // certifique-se de criar este bucket no Supabase

// Cliente Supabase para upload (server-side)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const runtime = "nodejs"; // garantir ambiente Node
export const dynamic = "force-dynamic"; // evitar cache

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const formData = await req.formData();
    const files: File[] = [];

    // aceita até 3 arquivos: 'images' pode ser múltiplo
    const images = formData.getAll("images");
    for (const item of images) {
      if (item instanceof File) files.push(item);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }
    if (files.length > 3) {
      return NextResponse.json({ error: "Máximo de 3 imagens por produto" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `products/${fileName}`; // pasta interna opcional

      // faz upload para o bucket products
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "application/octet-stream",
        });

      if (error) {
        return NextResponse.json({ error: `Falha no upload: ${error.message}` }, { status: 500 });
      }

      const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      if (!publicData?.publicUrl) {
        return NextResponse.json({ error: "Não foi possível obter a URL pública" }, { status: 500 });
      }

      uploadedUrls.push(publicData.publicUrl);
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erro inesperado" }, { status: 500 });
  }
}