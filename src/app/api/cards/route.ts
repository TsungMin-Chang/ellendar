import { NextResponse, type NextRequest } from "next/server";

import { eq, asc } from "drizzle-orm";

import { db } from "@/db";
import { cardsTable, memosTable } from "@/db/schema";
import type { DbMemo, DbCards } from "@/lib/types";
import type {
  PostCardRequest,
  UpdateCardRequest,
} from "@/validators/crudTypes";
import {
  postCardRequestSchema,
  updateCardRequestSchema,
} from "@/validators/crudTypes";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    const dbCards = await db
      .select({
        name: cardsTable.name,
      })
      .from(cardsTable)
      .where(eq(cardsTable.userId, userId))
      .orderBy(asc(cardsTable.createdAt))
      .execute();

    const data: DbCards = {};
    for (let i = 0; i < dbCards.length; i++) {
      const key: string = dbCards[i].name;
      const value: DbMemo[] = await db
        .select({
          id: memosTable.id,
          cardName: memosTable.cardName,
          title: memosTable.title,
          description: memosTable.description,
        })
        .from(memosTable)
        .where(eq(memosTable.cardName, key))
        .orderBy(asc(memosTable.createdAt))
        .execute();
      data[key] = value;
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong in db" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    postCardRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { userId, name } = data as PostCardRequest;

  try {
    await db
      .insert(cardsTable)
      .values({
        userId,
        name,
      })
      .execute();
    return NextResponse.json("OK", { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong in db" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const data = await request.json();

  try {
    updateCardRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { name, prevName } = data as UpdateCardRequest;

  try {
    await db
      .update(cardsTable)
      .set({ name })
      .where(eq(cardsTable.name, prevName))
      .execute();
    return NextResponse.json("OK", { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong in db" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const cardName = request.headers.get("cardName");
  if (!cardName) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    await db.delete(cardsTable).where(eq(cardsTable.name, cardName)).execute();
    return NextResponse.json("OK", { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong in db" },
      { status: 500 },
    );
  }
}