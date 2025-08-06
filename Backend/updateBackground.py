from portfolio.models import BackgroundData

# 🔁 Update entry for "kuxi"
try:
    bg1 = BackgroundData.objects.get(owner="kuxi")
    bg1.navColor = "#E0585B"
    bg1.arrowColor = "#E0585B"
    bg1.ellipseWidth = 0
    bg1.ellipseHeight = 0
    bg1.save()
    print(f"✅ Updated BackgroundData entry for owner 'kuxi' (ID: {bg1.id})")
except BackgroundData.DoesNotExist:
    print("❌ BackgroundData entry for 'kuxi' not found.")

# 🔁 Update entry for "COMPANY"
try:
    bg2 = BackgroundData.objects.get(owner="COMPANY")
    bg2.navColor = "#561B39"
    bg2.arrowColor = "#561B39"
    bg2.ellipseWidth = 0
    bg2.ellipseHeight = 0
    bg2.save()
    print(f"✅ Updated BackgroundData entry for owner 'COMPANY' (ID: {bg2.id})")
except BackgroundData.DoesNotExist:
    print("❌ BackgroundData entry for 'COMPANY' not found.")