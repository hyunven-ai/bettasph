import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AuctionDetailClient from "./AuctionDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabaseAdmin
    .from("auctions")
    .select("fish_name, description, image_urls, category, grade")
    .eq("id", id)
    .single();

  if (!data) return { title: "Lelang tidak ditemukan" };

  return {
    title: `Lelang: ${data.fish_name}`,
    description: data.description?.slice(0, 155) ||
      `Ikuti lelang ${data.fish_name} ${data.grade ? `Grade ${data.grade}` : ""} di ikanpedia.id`,
    openGraph: {
      images: data.image_urls?.[0] ? [{ url: data.image_urls[0] }] : [],
    },
  };
}

export default async function AuctionDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Validasi ID format UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) notFound();

  // Cek apakah lelang ada
  const { data } = await supabaseAdmin
    .from("auctions")
    .select("id, status")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <AuctionDetailClient auctionId={id} />;
}
