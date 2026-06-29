"""Pass 1 triage of Global Birdfair 2026 exhibitors.

Heuristics applied to name + country (NO website visit):
  deepdive   -> Pass 2 will visit website and produce full A/B/C/D block
  lowpri     -> auto-Low priority, terse rationale, no website lookup needed

Rules for deepdive:
  - Country = The Gambia, Ghana/West Africa (auto A/B candidates)
  - UK-based travel/tour operators (most W Africa specialists live here)
  - Major multi-region international birding tour operators (Rockjumper, Tropical Birding,
    Birdtour Asia HQ etc.) that *might* run Gambia in portfolio
  - Conservation / media with international remit touching W Africa
    (BirdLife International, African Bird Club, Fauna & Flora, WWF, Birdwatching Magazine)

Everything else -> lowpri with a one-line reason.
"""
import csv

LOWPRI_REASONS = {
    # Optics / equipment / camera brands
    "Swarovski Optik": "Optics brand - not a tour operator/conservation org",
    "Birdfy by Netvue": "Smart bird feeder hardware brand",
    "GPO (German Precision Optics) Binoculars": "Optics brand",
    "Videndum (Manfrotto / Lowepro / Gitzo )": "Camera equipment brand",
    "OM System": "Camera brand",
    "Fujifilm UK": "Camera brand",
    "Hawke Optics": "Optics brand",
    "Kite Optics / Sights of Nature": "Optics brand",
    "MAC Group Europe": "Photo equipment distributor",
    "NYA EVO": "Camera bag brand",
    "Opticron": "Optics brand",
    "Park Cameras": "Camera retailer",
    "Revolve Technology Ltd": "Tech/equipment brand",
    "SpeediGimbal": "Tripod/gimbal brand",
    "Thermal4Birding": "Thermal optics retailer",
    "Thomas Jacks Limited (Pulsar)": "Thermal optics distributor",
    "Tragopan": "Photography hide/equipment brand",
    "Viking Optical Limited": "Optics brand",
    "Vortex": "Optics brand",

    # Non-W-Africa destination tourism boards / DMOs
    "Tasmanian Odyssey, South Australia Tourism Commission & Australian Wildlife Journeys": "Australia DMO - no W Africa relevance",
    "Embratur Brasil": "Brazil national tourism board",
    "Costa Rica Birding Board": "Costa Rica DMO",
    "Zadar County Tourist Board": "Croatia regional DMO",
    "Falkland Islands Tourist Board": "Falklands DMO",
    "French Parcs": "France parks marketing body",
    "Region of Central Macedonia, Greece": "Greece regional DMO",
    "Natural Environment & Climate Change Agency, Greece": "Greece public agency",
    "Guyana Tourism Authority": "Guyana DMO",
    "Uttar Pradesh Tourism": "India regional DMO",
    "PromPeru": "Peru national tourism board",
    "Promtur Panama": "Panama DMO",
    "Panama's Bird Team - Promtur Panama": "Panama DMO/bird team - in-country",
    "Asturias Tourism (Spain)": "Spain regional DMO",
    "Ayuntamiento de Noja": "Spain municipal authority",
    "Castilla y León Tourism Board": "Spain regional DMO",
    "Extremadura Tourism Board": "Spain regional DMO",
    "Region of Valencia": "Spain regional DMO",
    "Cairngorms National Park Authority": "Scottish national park",
    "Discover Rutland": "Local UK DMO (host area)",
    "Lee Valley Regional Park Authority": "Local UK park authority",
    "Rutland Water - Anglian Water": "Local UK reserve operator",
    "Uganda High Commission": "Diplomatic mission - not commercial",

    # In-country regional birding ops (their destination, not W Africa)
    "Birds Argentina & Southern South America": "S America in-country operator",
    "Brazil Birding Experts": "Brazil in-country operator",
    "Serra dos Tucanos Eco-turismo Ltda": "Brazil lodge/operator",
    "Albatross Birding and Wildlife Photography in Chile": "Chile in-country operator",
    "Birds Chile": "Chile in-country operator",
    "China Bird Tour": "China in-country operator",
    "Jaguarundi Travel Colombia": "Colombia in-country operator",
    "Neotropical Birding and Conservation": "Neotropics-focused operator",
    "Wildbird Tours Costa Rica": "Costa Rica in-country operator",
    "Bellavista Cloud Forest Lodge": "Ecuador lodge",
    "Ecobiosfera Expediciones": "Ecuador in-country operator",
    "Ecuador Nature Expeditions": "Ecuador in-country operator",
    "El Septimo Paraiso (Lodge & Cloud Forest Reserve)": "Ecuador lodge",
    "Birding Haapsalu": "Estonia regional birding",
    "Birding Ethiopia Tour": "Ethiopia in-country operator (E Africa)",
    "Falkland Island Holidays": "Falklands in-country operator",
    "Buseu Wild Pyrenees Nature Photography": "Pyrenees in-country photo operator",
    "Neophron Tours": "Italy/Balkans operator",
    "On Track Safaris": "E Africa (Kenya/Tanzania) safaris",
    "Alcedo Wildlife Tours and Juodkrante Bird Observatory": "Lithuania in-country operator",
    "Cactus Tours Madagascar": "Madagascar in-country operator",
    "Nepal Nature Treks and Tours PVT": "Nepal in-country operator",
    "Canopy Family, Panama": "Panama lodge",
    "Tranquilo Bay Eco Adventure Lodge": "Panama lodge",
    "Biebrza Wildlife Trust": "Poland local trust",
    "Wild Poland": "Poland in-country operator",
    "Wildlife Poland": "Poland in-country operator",
    "Birds & Nature Tours Portugal": "Portugal in-country operator",
    "Letaka Safaris": "Botswana safaris (S Africa)",
    "Andalusian Wildlife Guides": "Spain regional operator",
    "Gato Clavo (Iberian Lynx photography experiences)": "Spain regional photo experience",
    "Jetwing Eco Holidays Pvt Ltd": "Sri Lanka in-country operator",
    "Taiwan Bird Guide": "Taiwan in-country operator",
    "Lawson's Birding, Wildlife & Custom Safaris": "E/S Africa safaris",
    "Livingstone African Safaris Ltd": "Zambia/Zimbabwe safaris (S Africa)",
    "Asian Adventures": "Asia in-country operator (US-based)",
    "Far South Expeditions": "S America in-country operator",
    "Mongolia Quest LLC": "Mongolia in-country operator",
    "Southern Sky Adventures": "Likely S Hemisphere niche operator",
    "Global Wildlife Fair (Asian Adventures)": "Asia trade fair / operator",
    "Langur Eco Travels - Bhutan": "Bhutan in-country operator",
    "Falklands Conservation": "Falklands-specific conservation NGO",

    # Local UK / European single-species or single-site NGOs
    "Committee Against Bird Slaughter (CABS)": "Anti-poaching NGO (Mediterranean focus)",
    "Association Biom (Birdlife Croatia)": "Croatia BirdLife partner",
    "BirdLife Cyprus": "Cyprus BirdLife partner",
    "Action for Swifts": "UK single-species NGO",
    "Bird Observatories Council": "UK bird observatory umbrella",
    "British Decoy & Wildfowl Carvers Association": "UK hobby association",
    "British Dragonfly Society": "UK insect conservation NGO",
    "Butterfly Conservation East Midlands": "UK regional NGO",
    "Curlew Action": "UK single-species NGO",
    "Fair Isle Bird Observatory": "UK bird observatory",
    "House Martin Conservation UK & Ireland": "UK single-species NGO",
    "Humane Wildlife Solutions": "UK humane pest control",
    "Leicestershire and Rutland Mammal Group": "Local UK NGO",
    "Leicestershire and Rutland Ornithological Society (LROS)": "Local UK NGO",
    "Naturewatch Foundation": "UK animal welfare NGO",
    "Operation Seabird": "UK marine awareness NGO",
    "Pan-species Listing": "UK hobby community",
    "Plantlife": "UK plant conservation",
    "Planet Birdsong Foundation": "UK sound/recording NGO",
    "Sounding Wild": "UK nature sound recording",
    "Spurn Bird Observatory Trust": "UK bird observatory",
    "The Royal Society for Wildlife Trusts": "UK domestic conservation",
    "The Species Recovery Trust": "UK domestic conservation",
    "The Woodland Trust": "UK domestic conservation",
    "Wader Quest": "UK shorebird NGO",
    "Wild Your Garden Ltd.": "UK gardening NGO",
    "Woolley Wildlife": "UK small NGO/retailer",
    "World Pheasant Association": "Pheasant single-family NGO",
    "Yorkshire Coast Nature": "UK regional operator",
    "Greenpeace": "Generalist environmental NGO - not bird tourism",
    "Dogs Trust": "Dog welfare charity - unrelated",
    "WWF": "Generalist NGO - no Gambia tour pipeline",
    "SEO/BirdLife": "Spain BirdLife partner",
    "Crossbill Guides Foundation": "Europe nature guidebook publisher",

    # Books / publishers / media (non-trade)
    "Atropos": "UK entomology journal",
    "Princeton Nature": "Books publisher",
    "Lynx Nature Books (Alada Books, S.L.)": "Books publisher",
    "NHBS": "Natural history bookseller",
    "Garrick Books": "Books seller",
    "WBSJ Shop by Wagumi": "Japan birding merchandise shop",
    "Birdwatching Magazine": "UK consumer magazine - keep as Low-Medium media touchpoint",

    # Hotels / venues / local UK accommodation
    "Grant Arms Hotel / BWWC": "UK birdwatching hotel",
    "Heights Hotel": "UK hotel",
    "Aigas Field Centre": "UK field study centre",

    # Misc retailers / hobby / decor
    "Lotus Bakery": "Bakery - unrelated",
    "Let's Bee Organic": "Bee/honey retailer",
    "Peak Boxes": "Nestbox maker",
    "Wild Herz Ltd": "Likely retailer",
    "Warwickshire Clothing": "Clothing retailer",
    "Barefoot Eco Surveys": "Survey services",
    "Button and Squirt": "Likely craft/hobby",
    "Geckoman": "Likely artist/retailer",
    "Global Birdfair 2026 Mural": "Event installation",
    "Hayley Jones Wire Sculptures": "Artist",
    "Creating Wool Art": "Artist",
    "Crowartist": "Artist",
    "D Smith Glasscraft": "Artist/craft",
    "Darren Woodhead": "Artist",
    "David Finney, Artist": "Artist",
    "David Tipling Wildlife Photographer": "Photographer (could be media touchpoint, low priority)",
    "Eilbhe Donovan - Seven Heads Studio": "Artist",
    "Ferne Creative": "Artist/creative",
    "Gareth Watling British Bird Paintings": "Artist",
    "Gouge Away Carvings": "Artist/carver",
    "Helen Whittle, Artist": "Artist",
    "Irene Brierton SWA - Wildlife Artist": "Artist",
    "John Cox Wildlife Artist": "Artist",
    "Jonathan Pomroy Wildlife and Landscape Artist": "Artist",
    "Kate Cree Artist": "Artist",
    "KS Nature Photography": "Photographer",
    "Mark Andrews Artist": "Artist",
    "Michael Potts": "Likely artist",
    "Nicky Heard Artist": "Artist",
    "Nicola Jane Art": "Artist",
    "Richard Lewington, Wildlife Illustrator": "Illustrator",
    "Ruth's Portraits": "Artist",
    "Sara Budzik Studio": "Artist",
    "Sophie Nash Wildlife Art": "Artist",
    "Stephen Message Art": "Artist",
    "Victoria Carr, Artist": "Artist",
    "SWLA Printmaking Area": "Artists collective installation",
    "The Feather Lady": "Craft retailer",
    "The Society of Wildlife Artists - SWLA": "Artists association",
    "WildArt Bird Photography Awards": "Photo competition (media touchpoint)",
    "Focused On Wildlife": "Photo platform",
    "Abelmosaics - Raising Awareness for Critically Endangered Species": "Mosaic artist",
    "Hiro Takahashi, Artist": "Artist",
    "Clinton Banbury Illustration": "Illustrator",
    "Joris De Raedt Illustration and Graphics": "Illustrator",

    # BirdLife affiliates with non-W-Africa focus
    "BirdLife International": "Treat as Pass-2 deepdive - keep here actually NO -> see deepdive list",
}
# Remove the misplaced one
LOWPRI_REASONS.pop("BirdLife International")

# Override: BirdLife affiliates that we still mark D-Low without web visit (national partners outside Africa region)
# Already covered above (CABS, BirdLife Cyprus, SEO/BirdLife, Biom)

# Deepdive set
DEEPDIVE_NOTE = {
    # Auto Cat A
    "The Gambia Tourism Board": "Cat A presumed - The Gambia",
    # Auto Cat B / W Africa
    "Ashanti African Tours Limited": "Cat B presumed - Ghana / West Africa",
    "African Bird Club": "Touches W Africa - conservation/media",
    "BirdLife International": "Global umbrella - W Africa partners exist",
    # UK trade ops & specialist birding tour ops -> verify Gambia/W Africa portfolio
    "2by2 Holidays": "UK tour op", "Aqua-Firma Worldwide": "UK wildlife travel",
    "Ark Expeditions": "UK", "Alpine Birding": "UK",
    "All4birding": "UK", "Bellbird Tours": "UK",
    "Bespoke India Travel": "UK regional - low likely",
    "Biotropica Expeditions": "UK", "Birder Travel trading as Sicklebill Safaris": "UK Africa-themed",
    "Birdfinders": "UK specialist - likely Gambia seller",
    "Birding Direct": "UK", "Birding the Islands Ltd": "UK islands focus",
    "Bird's Wildlife & Nature Tours": "UK",
    "Birds & The Belles": "UK", "Birdtour Asia Limited": "UK Asia specialist",
    "Bluetail Birding": "UK", "Briggate Travel": "UK",
    "Eco Terra Adventures Limited": "UK",
    "Ganders Travel": "UK", "Greentours": "UK",
    "HADCO Experiences": "UK", "Heatherlea Birdwatching Ltd": "UK",
    "Hebridean Adventures": "UK Scottish",
    "Limosa Holidays": "UK specialist birding",
    "Manakin Nature Tours": "UK/LATAM",
    "Nature Experience": "UK",
    "Natureray Limited": "UK",
    "Naturetrek": "UK major - confirmed Gambia seller historically",
    "Nungunungu Expeditions": "UK Africa-themed",
    "Oriole Birding Limited": "UK",
    "Partnership for International Birding": "UK/US trade body",
    "Quest Nature Tours": "UK",
    "Reef and Rainforest Tours Ltd": "UK",
    "Secret Atlas": "UK",
    "Stealth Birding Limited": "UK",
    "The Birdway": "UK",
    "Travel The Unknown": "UK",
    "Trogon Tours": "UK",
    "Warbler Tours": "UK",
    "Wild Discovery": "UK",
    "Wild Nature Quest": "UK",
    "Wildfoot Travel": "UK",
    "Wildlife Worldwide & The Travelling Naturalist": "UK major multi-region",
    "WildSpaceGroup": "UK",
    "Wildwings Travel": "UK",
    "Fauna and Flora": "UK conservation - global incl Africa",
    "Aigas Field Centre": None,  # leave as lowpri (UK domestic)
    # International birding ops that could sell Gambia in portfolio
    "Rockjumper Birding Tours": "S Africa - global birding incl Gambia historically",
    "Tropical Birding": "US-based global birding op",
    "Oriental Bird Club": "Asia-focused but verify",
    "Ornithological Society of the Middle East, The Caucasus and Central Asia (OSME)": "Regional club - verify",
    "Cornell Lab - eBird and Merlin Bird ID": "Major media/data platform",
}
DEEPDIVE_NOTE.pop("Aigas Field Centre")

# Read raw
rows = []
with open('/Users/alexjeffries/Tourism/tourism-commons/projects/gambia/birding/exhibitors_raw.csv') as f:
    r = csv.DictReader(f)
    for row in r:
        rows.append(row)

triaged = []
for row in rows:
    name = row['name']
    country = row['country']
    if name in DEEPDIVE_NOTE:
        triaged.append({'name': name, 'country': country, 'bucket': 'deepdive', 'pass1_note': DEEPDIVE_NOTE[name]})
    elif name in LOWPRI_REASONS:
        triaged.append({'name': name, 'country': country, 'bucket': 'lowpri', 'pass1_note': LOWPRI_REASONS[name]})
    else:
        # Unclassified -> deepdive (safer)
        triaged.append({'name': name, 'country': country, 'bucket': 'deepdive', 'pass1_note': 'unclassified - default to deepdive'})

# Stats
from collections import Counter
c = Counter(t['bucket'] for t in triaged)
print('Triage bucket counts:', dict(c))

# Write
out = '/Users/alexjeffries/Tourism/tourism-commons/projects/gambia/birding/triage.csv'
with open(out, 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=['name', 'country', 'bucket', 'pass1_note'])
    w.writeheader()
    for t in triaged:
        w.writerow(t)
print('wrote', out)

# Print unclassified (should be empty or near empty)
unclassified = [t for t in triaged if t['pass1_note'] == 'unclassified - default to deepdive']
print(f'\nUnclassified (auto deepdive): {len(unclassified)}')
for u in unclassified:
    print(f"  {u['country']} :: {u['name']}")
