-- CreateIndex
CREATE INDEX "events_app_id_created_at_idx" ON "events"("app_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "events_app_id_type_idx" ON "events"("app_id", "type");
