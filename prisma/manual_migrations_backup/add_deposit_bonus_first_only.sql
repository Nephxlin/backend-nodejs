-- Add column to control if bonus is only for first deposit
ALTER TABLE "settings" ADD COLUMN "deposit_bonus_first_only" BOOLEAN NOT NULL DEFAULT true;
