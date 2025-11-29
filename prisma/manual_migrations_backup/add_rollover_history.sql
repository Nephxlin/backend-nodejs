-- CreateTable
CREATE TABLE "rollover_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "bet_amount" DECIMAL(20,2) NOT NULL,
    "rollover_before" DECIMAL(20,2) NOT NULL,
    "rollover_after" DECIMAL(20,2) NOT NULL,
    "rollover_type" TEXT NOT NULL,
    "game_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rollover_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rollover_history_user_id_idx" ON "rollover_history"("user_id");
