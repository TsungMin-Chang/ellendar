"use client";

import { useState, useEffect } from "react";
import { GiPencil } from "react-icons/gi";
import { TiDelete } from "react-icons/ti";

import IconButton from "@mui/material/IconButton";

import useCard from "@/hooks/useCard";
import type { DbCards } from "@/lib/types";

import CategoryCard from "./_components/CategoryCard";

export default function MemoPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [cardsData, setCardsData] = useState<DbCards>({});
  const [refreshCards, setRefreshCards] = useState(false);
  const { getCards, postCard, deleteCard } = useCard();

  useEffect(() => {
    async function fetchData() {
      const resData = await getCards();
      setCardsData(resData.data);
    }
    fetchData();
  }, [refreshCards]);

  return (
    <>
      <div
        className="flex flex-col gap-y-5 bg-[#442B0D] px-10 py-5"
        style={{ height: "94vh" }}
      >
        <div className="flex flex-col gap-y-6">
          {/* Memo && Edit-Cards Button*/}
          <div className="flex flex-row justify-between">
            <div className="ml-2 text-lg font-bold text-zinc-200">Memo</div>
            <button
              className="pr-2"
              onClick={() => setIsEditing((prev) => !prev)}
            >
              <GiPencil size={28} color="orange" />
            </button>
          </div>

          {/* TODO: put General Card here */}

          {Object.keys(cardsData).map((cardName) => (
            <div key={cardName} className="relative">
              {/* Delete-Card Button */}
              {isEditing && (
                <div className="z-3 absolute -right-4 -top-4">
                  <IconButton
                    onClick={async () => {
                      await deleteCard(cardName);
                      setRefreshCards((prev) => !prev);
                    }}
                  >
                    <TiDelete size={28} color="red" />
                  </IconButton>
                </div>
              )}

              {/* Card */}
              <CategoryCard 
                cardName={cardName} 
                memos={cardsData[cardName]} 
                onRefreshCards={() => setRefreshCards((prev) => !prev)}
              />
            </div>
          ))}

          {/* Add-Card Button */}
          {isEditing && (
            <button
              onClick={async () => {
                await postCard();
                setRefreshCards((prev) => !prev);
              }}
              className="rounded-lg border-2 border-zinc-400 bg-[#634d3f] p-2 font-semibold text-white transition-all duration-300"
            >
              + Category
            </button>
          )}
        </div>
      </div>
    </>
  );
}