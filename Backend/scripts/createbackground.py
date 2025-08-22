# seed_background_data.py

from portfolio.models import BackgroundData

# First entry
bg1 = BackgroundData.objects.create(
    owner="kuxi",
    color1="#D81B1E",
    color2="#330321",
    color3="#050319",
    position1="11%",
    position2="38%",
    position3="80%",
    page1="About-me",
    page2="CV",
)
print(f"✅ Created BackgroundData entry 1 with ID: {bg1.id}")

# Second entry
bg2 = BackgroundData.objects.create(
    owner="shmooz",
    color1="#712243",
    color2="#181532",
    color3="#050319",
    position1="0%",
    position2="46%",
    position3="71%",
    page1="About-us",
    page2="Contact-us",
)
print(f"✅ Created BackgroundData entry 2 with ID: {bg2.id}")
