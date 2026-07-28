# نص برمجي لتهيئة موارد Google Cloud لـ Bouiba Academy تلقائياً
$ErrorActionPreference = "Stop"

$gcloud = "C:\Users\ABDERAZAK\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
$bq = "C:\Users\ABDERAZAK\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\bq.cmd"
$gsutil = "C:\Users\ABDERAZAK\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gsutil.cmd"
$env:CLOUDSDK_METRICS_ENVIRONMENT="datacloud.antigravity"

Write-Host "1. تفعيل واجهات البرمجة (APIs)..." -ForegroundColor Cyan
& $gcloud services enable storage.googleapis.com bigquery.googleapis.com

Write-Host "2. إنشاء حاوية التخزين (GCS Bucket)..." -ForegroundColor Cyan
try {
    & $gsutil mb -p bouiba-academy -l us-central1 gs://bouiba-academy-media
    Write-Host "تم إنشاء الحاوية gs://bouiba-academy-media بنجاح." -ForegroundColor Green
} catch {
    Write-Host "الحاوية قد تكون موجودة بالفعل أو الاسم محجوز، نقوم بالمتابعة..." -ForegroundColor Yellow
}

Write-Host "3. إنشاء قاعدة بيانات BigQuery Dataset..." -ForegroundColor Cyan
try {
    & $bq mk --location=US --label datacloud=antigravity bouibacademy_analytics
} catch {
    Write-Host "Dataset موجودة بالفعل، نقوم بالمتابعة..." -ForegroundColor Yellow
}

Write-Host "4. إنشاء جدول student_events في BigQuery..." -ForegroundColor Cyan
try {
    & $bq mk --table --label datacloud=antigravity bouibacademy_analytics.student_events event_name:STRING,url:STRING,user_id:STRING,metadata:JSON,timestamp:TIMESTAMP
} catch {
    Write-Host "الجدول موجود بالفعل، نقوم بالمتابعة..." -ForegroundColor Yellow
}

Write-Host "5. إنشاء حساب الخدمة (Service Account)..." -ForegroundColor Cyan
try {
    & $gcloud iam service-accounts create bouiba-server-sa --display-name="Bouiba Server Service Account"
} catch {
    Write-Host "حساب الخدمة موجود بالفعل، نقوم بالمتابعة..." -ForegroundColor Yellow
}

Write-Host "6. إعطاء الصلاحيات لحساب الخدمة..." -ForegroundColor Cyan
& $gcloud projects add-iam-policy-binding bouiba-academy --member="serviceAccount:bouiba-server-sa@bouiba-academy.iam.gserviceaccount.com" --role="roles/storage.objectAdmin"
& $gcloud projects add-iam-policy-binding bouiba-academy --member="serviceAccount:bouiba-server-sa@bouiba-academy.iam.gserviceaccount.com" --role="roles/bigquery.dataEditor"

Write-Host "7. توليد وتحميل ملف مفتاح الدخول (JSON Key)..." -ForegroundColor Cyan
if (Test-Path "gcp-key.json") {
    Remove-Item "gcp-key.json" -Force
}
& $gcloud iam service-accounts keys create gcp-key.json --iam-account=bouiba-server-sa@bouiba-academy.iam.gserviceaccount.com

Write-Host "✨ اكتملت تهيئة جميع موارد GCP بنجاح! تم إنشاء مفتاح الدخول في gcp-key.json" -ForegroundColor Green
