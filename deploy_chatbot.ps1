# deploy_chatbot.ps1

$ProjectRef = "yydtsteyknbpfpxjtlxe"
$ResendApiKey = "re_BAeSuAno_9sLaTnwVp4J5j7XPtCpNe1Kj"

Write-Host "Starting Chatbot Notification Deployment..."

# Link Project
Write-Host "Linking Supabase project: $ProjectRef"
cmd /c "npx -y supabase link --project-ref $ProjectRef"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to link project. Please ensure you are logged in (npx supabase login)."
    exit
}

# Set Secret
Write-Host "Setting RESEND_API_KEY..."
cmd /c "npx -y supabase secrets set RESEND_API_KEY=$ResendApiKey"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to set secret."
    exit
}

# Deploy Function
Write-Host "Deploying function 'send-chat-notification'..."
cmd /c "npx -y supabase functions deploy send-chat-notification --no-verify-jwt"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful! Chatbot notifications are now live."
} else {
    Write-Host "Deployment failed."
}
