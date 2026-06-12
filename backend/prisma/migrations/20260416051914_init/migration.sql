-- CreateTable
CREATE TABLE "LatestTopGames" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topGames" TEXT[],

    CONSTRAINT "LatestTopGames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "game24hrPeak" INTEGER NOT NULL,
    "record" INTEGER NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("gameId")
);

-- CreateTable
CREATE TABLE "PlayerCount" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "players" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "PlayerCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformStats" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onlinePlayers" INTEGER NOT NULL,

    CONSTRAINT "PlatformStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LatestTopGames_timestamp_key" ON "LatestTopGames"("timestamp");

-- CreateIndex
CREATE INDEX "PlayerCount_gameId_timestamp_idx" ON "PlayerCount"("gameId", "timestamp");

-- CreateIndex
CREATE INDEX "PlayerCount_timestamp_idx" ON "PlayerCount"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCount_gameId_timestamp_key" ON "PlayerCount"("gameId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformStats_timestamp_key" ON "PlatformStats"("timestamp");

-- CreateIndex
CREATE INDEX "PlatformStats_timestamp_idx" ON "PlatformStats"("timestamp");

-- AddForeignKey
ALTER TABLE "PlayerCount" ADD CONSTRAINT "PlayerCount_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;
