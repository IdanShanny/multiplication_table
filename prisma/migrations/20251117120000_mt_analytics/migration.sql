-- CreateTable
CREATE TABLE "MtPlayer" (
    "id" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latestName" TEXT,
    "latestGender" TEXT,

    CONSTRAINT "MtPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MtRegistration" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MtRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MtVisit" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitKind" TEXT NOT NULL,
    "name" TEXT,
    "gender" TEXT,
    "group1Count" INTEGER,
    "group2Count" INTEGER,
    "group3Count" INTEGER,
    "group4Count" INTEGER,
    "appVersion" TEXT,
    "sessionMs" INTEGER,

    CONSTRAINT "MtVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MtRegistration_playerId_registeredAt_idx" ON "MtRegistration"("playerId", "registeredAt");

-- CreateIndex
CREATE INDEX "MtVisit_playerId_visitedAt_idx" ON "MtVisit"("playerId", "visitedAt");

-- AddForeignKey
ALTER TABLE "MtRegistration" ADD CONSTRAINT "MtRegistration_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "MtPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MtVisit" ADD CONSTRAINT "MtVisit_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "MtPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;