/*
  Warnings:

  - You are about to drop the `_itemsInList` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,name]` on the table `list` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `list` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_itemsInList" DROP CONSTRAINT "_itemsInList_A_fkey";

-- DropForeignKey
ALTER TABLE "_itemsInList" DROP CONSTRAINT "_itemsInList_B_fkey";

-- DropIndex
DROP INDEX "user_id_key";

-- AlterTable
ALTER TABLE "list" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "_itemsInList";

-- CreateTable
CREATE TABLE "item_list" (
    "itemId" TEXT NOT NULL,
    "listId" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "item_list_itemId_idx" ON "item_list"("itemId");

-- CreateIndex
CREATE INDEX "item_list_listId_idx" ON "item_list"("listId");

-- CreateIndex
CREATE UNIQUE INDEX "item_list_itemId_listId_key" ON "item_list"("itemId", "listId");

-- CreateIndex
CREATE INDEX "item_userId_idx" ON "item"("userId");

-- CreateIndex
CREATE INDEX "list_userId_idx" ON "list"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "list_userId_name_key" ON "list"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "item_list" ADD CONSTRAINT "item_list_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_list" ADD CONSTRAINT "item_list_listId_fkey" FOREIGN KEY ("listId") REFERENCES "list"("id") ON DELETE CASCADE ON UPDATE CASCADE;
