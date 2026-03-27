-- CreateIndex
CREATE INDEX "EmployerProfile_verificationStatus_createdAt_idx" ON "EmployerProfile"("verificationStatus", "createdAt");

-- CreateIndex
CREATE INDEX "User_role_createdAt_idx" ON "User"("role", "createdAt");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
