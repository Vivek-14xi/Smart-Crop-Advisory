from fastapi import APIRouter, Query, HTTPException

router = APIRouter(
    prefix="/api/government-schemes",
    tags=["Government Schemes"]
)

SCHEMES = [
    {
        "id": 1,
        "name": "PM-KISAN Samman Nidhi",
        "description": "Provides eligible farmer families with financial assistance through direct benefit transfers.",
        "benefits": "₹6,000 per year, subject to eligibility and scheme rules.",
        "eligibility": "Eligible landholding farmer families, subject to applicable exclusions and verification.",
        "official_url": "https://pmkisan.gov.in/",
        "category": "Financial Assistance"
    },
    {
        "id": 2,
        "name": "Pradhan Mantri Fasal Bima Yojana",
        "description": "Provides crop insurance coverage against specified crop losses and risks.",
        "benefits": "Insurance protection according to the notified scheme and policy terms.",
        "eligibility": "Eligibility depends on the notified crop, area, season, and applicable enrolment rules.",
        "official_url": "https://pmfby.gov.in/",
        "category": "Crop Insurance"
    },
    {
        "id": 3,
        "name": "Kisan Credit Card",
        "description": "Helps eligible farmers access credit for agricultural and related activities.",
        "benefits": "Access to eligible agricultural credit under applicable lending terms.",
        "eligibility": "Eligible farmers and other qualifying agricultural borrowers, subject to lender requirements.",
        "official_url": "https://www.myscheme.gov.in/",
        "category": "Agricultural Credit"
    },
    {
        "id": 4,
        "name": "Soil Health Card Scheme",
        "description": "Helps farmers understand soil nutrient status and fertilizer recommendations.",
        "benefits": "Soil testing information and recommendations for better nutrient management.",
        "eligibility": "Farmers can check soil-testing services and availability through local agricultural authorities.",
        "official_url": "https://soilhealth.dac.gov.in/",
        "category": "Soil Health"
    },
    {
        "id": 5,
        "name": "PM Krishi Sinchai Yojana",
        "description": "Supports improved irrigation and water-use efficiency through applicable programme components.",
        "benefits": "Assistance may be available for eligible irrigation activities under relevant components.",
        "eligibility": "Eligibility and assistance depend on the component and state-level implementation.",
        "official_url": "https://pmksy.gov.in/",
        "category": "Irrigation"
    },
    {
        "id": 6,
        "name": "National Agriculture Market (e-NAM)",
        "description": "An electronic trading platform that connects agricultural markets.",
        "benefits": "Online market access and improved price discovery for participating farmers.",
        "eligibility": "Participation depends on registration and applicable mandi requirements.",
        "official_url": "https://www.enam.gov.in/",
        "category": "Agricultural Marketing"
    },
    {
        "id": 7,
        "name": "Agriculture Infrastructure Fund",
        "description": "Supports eligible projects that improve agricultural post-harvest infrastructure.",
        "benefits": "Financing support under applicable scheme guidelines and lending conditions.",
        "eligibility": "Eligible applicants and projects as defined by current scheme guidelines.",
        "official_url": "https://agriinfra.dac.gov.in/",
        "category": "Infrastructure"
    },
    {
        "id": 8,
        "name": "Paramparagat Krishi Vikas Yojana",
        "description": "Promotes organic farming practices and related farmer-group activities.",
        "benefits": "Support may be available for eligible organic farming activities.",
        "eligibility": "Eligible farmers or groups under applicable programme guidelines.",
        "official_url": "https://www.myscheme.gov.in/",
        "category": "Organic Farming"
    },
    {
        "id": 9,
        "name": "Pradhan Mantri Kisan Maandhan Yojana",
        "description": "A contributory pension scheme for eligible small and marginal farmers.",
        "benefits": "Pension benefits according to scheme conditions after qualifying requirements are met.",
        "eligibility": "Eligible farmers must meet the scheme's age, landholding and other conditions.",
        "official_url": "https://maandhan.in/",
        "category": "Pension"
    },
    {
        "id": 10,
        "name": "Mission for Integrated Development of Horticulture",
        "description": "Supports the development of horticulture, including fruits, vegetables and other eligible crops.",
        "benefits": "Assistance for eligible horticulture activities under applicable components.",
        "eligibility": "Depends on the programme component and state implementation.",
        "official_url": "https://midh.gov.in/",
        "category": "Horticulture"
    },
    {
        "id": 11,
        "name": "National Food Security Mission",
        "description": "Aims to improve the production and productivity of selected food crops.",
        "benefits": "Support for eligible crop-development activities under current guidelines.",
        "eligibility": "Depends on the notified crops, locations and programme components.",
        "official_url": "https://nfsm.gov.in/",
        "category": "Crop Production"
    },
    {
        "id": 12,
        "name": "Sub-Mission on Agricultural Mechanization",
        "description": "Promotes access to agricultural machinery and mechanization.",
        "benefits": "Eligible assistance for selected machinery or mechanization activities.",
        "eligibility": "Subject to current guidelines, state implementation and applicant category.",
        "official_url": "https://agrimachinery.nic.in/",
        "category": "Farm Machinery"
    },
    {
        "id": 13,
        "name": "Per Drop More Crop",
        "description": "Promotes efficient irrigation methods, including micro-irrigation.",
        "benefits": "Eligible support for water-efficient irrigation systems.",
        "eligibility": "Depends on current programme rules and state-level implementation.",
        "official_url": "https://pmksy.gov.in/",
        "category": "Water Management"
    },
    {
        "id": 14,
        "name": "National Bamboo Mission",
        "description": "Promotes bamboo cultivation, development and related value chains.",
        "benefits": "Support may be available for eligible bamboo-related activities.",
        "eligibility": "Depends on current programme components and applicable state guidelines.",
        "official_url": "https://nbm.nic.in/",
        "category": "Bamboo Cultivation"
    },
    {
        "id": 15,
        "name": "Soil Health Management",
        "description": "Promotes balanced nutrient management and improved soil health.",
        "benefits": "Support for eligible soil-management activities under applicable programmes.",
        "eligibility": "Depends on the relevant programme and local agricultural authorities.",
        "official_url": "https://soilhealth.dac.gov.in/",
        "category": "Soil Management"
    },
    {
        "id": 16,
        "name": "National Mission for Sustainable Agriculture",
        "description": "Promotes sustainable farming practices and climate-resilient agriculture.",
        "benefits": "Support through eligible components and associated agricultural programmes.",
        "eligibility": "Depends on the applicable component and state guidelines.",
        "official_url": "https://www.myscheme.gov.in/",
        "category": "Sustainable Agriculture"
    },
    {
        "id": 17,
        "name": "Rashtriya Krishi Vikas Yojana",
        "description": "Supports agricultural development projects implemented through participating states.",
        "benefits": "Benefits depend on the approved project and programme component.",
        "eligibility": "Depends on the specific project and state-level implementation.",
        "official_url": "https://rkvy.nic.in/",
        "category": "Agricultural Development"
    },
    {
        "id": 18,
        "name": "National Beekeeping and Honey Mission",
        "description": "Promotes beekeeping and the development of honey production and related activities.",
        "benefits": "Support may be available for eligible beekeeping and honey-sector projects.",
        "eligibility": "Depends on current programme guidelines and eligible activities.",
        "official_url": "https://www.myscheme.gov.in/",
        "category": "Beekeeping"
    },
    {
        "id": 19,
        "name": "Agricultural Marketing Infrastructure",
        "description": "Supports eligible agricultural marketing and post-harvest infrastructure activities.",
        "benefits": "Assistance may be available under applicable components and guidelines.",
        "eligibility": "Depends on current scheme rules and the applicant's project.",
        "official_url": "https://www.myscheme.gov.in/",
        "category": "Storage and Marketing"
    },
    {
        "id": 20,
        "name": "Kisan Credit Card for Animal Husbandry",
        "description": "Facilitates eligible working-capital credit for animal husbandry activities.",
        "benefits": "Access to eligible credit under applicable bank terms and guidelines.",
        "eligibility": "Eligible livestock farmers and other qualifying applicants, subject to lender requirements.",
        "official_url": "https://www.myscheme.gov.in/",
        "category": "Animal Husbandry"
    },
    {
        "id": 21,
        "name": "Kisan Credit Card for Fisheries",
        "description": "Facilitates eligible working-capital credit for fisheries-related activities.",
        "benefits": "Access to eligible fisheries credit under applicable lending conditions.",
        "eligibility": "Qualifying fishers, fish farmers and other eligible applicants under current rules.",
        "official_url": "https://www.myscheme.gov.in/",
        "category": "Fisheries"
    },
    {
        "id": 22,
        "name": "National Mission on Edible Oils – Oil Palm",
        "description": "Promotes oil-palm cultivation and development of the edible-oil supply chain.",
        "benefits": "Support may be available for eligible cultivation and related activities.",
        "eligibility": "Depends on current guidelines, eligible locations and state implementation.",
        "official_url": "https://www.myscheme.gov.in/",
        "category": "Oilseed Cultivation"
    },
    {
        "id": 23,
        "name": "National Mission on Natural Farming",
        "description": "Promotes natural farming practices and reduced dependence on external agricultural inputs.",
        "benefits": "Support and training may be available through eligible programme activities.",
        "eligibility": "Depends on current programme guidelines and local implementation.",
        "official_url": "https://www.myscheme.gov.in/",
        "category": "Natural Farming"
    },
    {
        "id": 24,
        "name": "National Livestock Mission",
        "description": "Supports eligible livestock-sector entrepreneurship and development activities.",
        "benefits": "Assistance may be available for eligible projects under current guidelines.",
        "eligibility": "Depends on the project, applicant category and applicable programme rules.",
        "official_url": "https://dahd.gov.in/",
        "category": "Livestock Development"
    },
    {
        "id": 25,
        "name": "Agriculture Technology Management Agency",
        "description": "Supports agricultural extension, farmer training and dissemination of farming practices.",
        "benefits": "Access to eligible training, demonstrations and agricultural extension activities.",
        "eligibility": "Availability depends on local agricultural extension programmes.",
        "official_url": "https://agriwelfare.gov.in/",
        "category": "Farmer Training"
    }
]


@router.get("/")
def get_schemes(
    search: str = Query(
        default="",
        description="Search schemes by name, category or description"
    )
):
    """Return government schemes, optionally filtered by search."""

    search_text = search.strip().lower()

    if not search_text:
        return {
            "total": len(SCHEMES),
            "schemes": SCHEMES
        }

    filtered_schemes = [
        scheme for scheme in SCHEMES
        if search_text in scheme["name"].lower()
        or search_text in scheme["category"].lower()
        or search_text in scheme["description"].lower()
        or search_text in scheme["benefits"].lower()
        or search_text in scheme["eligibility"].lower()
    ]

    return {
        "total": len(filtered_schemes),
        "schemes": filtered_schemes
    }


@router.get("/{scheme_id}")
def get_scheme(scheme_id: int):
    """Return details for one scheme."""

    scheme = next(
        (item for item in SCHEMES if item["id"] == scheme_id),
        None
    )

    if scheme is None:
        raise HTTPException(
            status_code=404,
            detail="Scheme not found"
        )

    return scheme