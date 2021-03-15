-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "properties" JSONB,

    PRIMARY KEY ("id")
);
