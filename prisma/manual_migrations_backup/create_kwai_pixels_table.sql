-- CreateTable
CREATE TABLE "kwai_pixels" (
    "id" SERIAL NOT NULL,
    "pixel_id" TEXT NOT NULL,
    "access_token" TEXT,
    "name" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kwai_pixels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kwai_pixels_pixel_id_key" ON "kwai_pixels"("pixel_id");


