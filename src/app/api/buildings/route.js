// src/app/api/buildings/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const buildings = await prisma.building.findMany();
  return NextResponse.json(buildings);
}

export async function POST(request) {
  const data = await request.json();
  const newBuilding = await prisma.building.create({ data });
  return NextResponse.json(newBuilding, { status: 201 });
}
