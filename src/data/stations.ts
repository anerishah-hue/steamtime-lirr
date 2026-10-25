import { CommuterRole, Station } from '../types';

export const STATIONS: Station[] = [
  {
    id: 'stony-brook',
    name: 'Stony Brook',
    branch: 'Port Jefferson Branch',
    zone: 10,
    accessible: true,
    distanceFromPennMiles: 54.8,
    lat: 40.92032252,
    lon: -73.12854943,
    stopId: '14',
    attractions: [
      {
        name: 'SBU Student Activities Center (SAC)',
        category: 'food',
        walkingMinutes: 3,
        description: 'Campus hub with food courts, dining options, and student cafe kiosks.',
        victorianTip: 'A brisk 3-minute stroll across the campus academic green.',
        budgetTier: 'under-25',
        priceEstimate: '$8 – $15',
        websiteUrl: 'https://www.stonybrook.edu/commcms/sac/'
      },
      {
        name: 'Druthers Coffee & Roasters',
        category: 'coffee',
        walkingMinutes: 8,
        description: 'Specialty espresso bar serving artisan pour-overs and fresh pastries.',
        victorianTip: 'Fine roasted beans roasted to perfection near Route 25A.',
        budgetTier: 'under-25',
        priceEstimate: '$5 – $12',
        websiteUrl: 'https://drutherscoffee.com'
      },
      {
        name: 'Green Cactus Mexican Grill',
        category: 'food',
        walkingMinutes: 6,
        description: 'Quick casual Mexican counter popular with students for burritos and tacos.',
        victorianTip: 'Hearty warm sustenance directly across from the train depot.',
        budgetTier: 'under-25',
        priceEstimate: '$12 – $20',
        websiteUrl: 'https://greencactusgrill.com'
      },
      {
        name: 'The Country House Restaurant (Historic 1710)',
        category: 'food',
        walkingMinutes: 18,
        description: 'Historic fine-dining tavern dating back to 1710, serving roasted meats and seafood.',
        victorianTip: 'An authentic Revolutionary-era landmark offering an exquisite dinner spread.',
        budgetTier: '50-plus',
        priceEstimate: '$55 – $85',
        websiteUrl: 'https://countryhouserestaurant.com'
      },
      {
        name: 'Stony Brook Village Center & Harbor',
        category: 'culture',
        walkingMinutes: 15,
        description: 'Colonial-style open-air shopping center, Post Office, and harbor waterfront views.',
        victorianTip: 'A pleasant seaside promenade adorned with historic architecture.',
        budgetTier: 'free',
        priceEstimate: 'Free to explore',
        websiteUrl: 'https://stonybrookvillage.com'
      },
      {
        name: 'Mirabelle Tavern at Three Village Inn',
        category: 'food',
        walkingMinutes: 16,
        description: 'Upscale regional dining, tavern cocktails, and seasonal farm-to-table plates.',
        victorianTip: 'A refined parlor room for sophisticated evening repasts.',
        budgetTier: '25-50',
        priceEstimate: '$30 – $50',
        websiteUrl: 'https://threevillageinn.com'
      }
    ]
  },
  {
    id: 'port-jefferson',
    name: 'Port Jefferson',
    branch: 'Port Jefferson Branch',
    zone: 10,
    accessible: true,
    distanceFromPennMiles: 59.4,
    lat: 40.9345531,
    lon: -73.05250164,
    stopId: '164',
    attractions: [
      {
        name: 'Dunkin\' (Port Jeff Station)',
        category: 'coffee',
        walkingMinutes: 4,
        description: 'Classic hot and iced coffee, donuts, breakfast sandwiches right on Route 112.',
        victorianTip: 'Hot coffee and baked glazed confections directly south of the depot tracks.',
        budgetTier: 'under-25',
        priceEstimate: '$4 – $10',
        websiteUrl: 'https://locations.dunkindonuts.com/en/ny/port-jefferson-station'
      },
      {
        name: 'Tara Inn',
        category: 'food',
        walkingMinutes: 3,
        description: 'Classic station-adjacent tavern famous for affordable burgers and friendly atmosphere.',
        victorianTip: 'Hearty fare directly facing the locomotive tracks since the 1970s.',
        budgetTier: 'under-25',
        priceEstimate: '$10 – $18',
        websiteUrl: 'https://tarainn.com'
      },
      {
        name: 'Local Steam Coffee House & Bakery',
        category: 'coffee',
        walkingMinutes: 10,
        description: 'Warm cafe serving cold brew, espresso, and freshly baked scones.',
        victorianTip: 'Steaming pots of fresh roast downport near the harbor.',
        budgetTier: 'under-25',
        priceEstimate: '$6 – $14',
        websiteUrl: 'https://portjeff.com'
      },
      {
        name: 'The Steam Room (Harbor Seafood)',
        category: 'food',
        walkingMinutes: 14,
        description: 'Casual open seafood shack right on Port Jeff harbor overlooking the ferry.',
        victorianTip: 'Fresh clams and steaming fish by the waterfront docks.',
        budgetTier: '25-50',
        priceEstimate: '$25 – $45',
        websiteUrl: 'https://thesteamroom.com'
      },
      {
        name: 'Port Jefferson Ferry Terminal',
        category: 'transit',
        walkingMinutes: 14,
        description: 'Passenger & auto ferry connecting Long Island across the Sound to Bridgeport, CT.',
        victorianTip: 'Grand maritime steam vessels embarking across Long Island Sound.',
        budgetTier: '25-50',
        priceEstimate: '$24 – $35',
        websiteUrl: 'https://88844ferry.com'
      },
      {
        name: 'Harborfront Park & Pier Promenade',
        category: 'nature',
        walkingMinutes: 15,
        description: 'Scenic public harbor park with shoreline boardwalk and picnic areas.',
        victorianTip: 'Breezy coastal views of the sound waters.',
        budgetTier: 'free',
        priceEstimate: 'Free',
        websiteUrl: 'https://portjeff.com/parks'
      }
    ]
  },
  {
    id: 'huntington',
    name: 'Huntington',
    branch: 'Port Jefferson Branch',
    zone: 7,
    accessible: true,
    distanceFromPennMiles: 36.6,
    lat: 40.85300971,
    lon: -73.40952576,
    stopId: '91',
    attractions: [
      {
        name: 'Station Sports & Diner',
        category: 'food',
        walkingMinutes: 2,
        description: 'All-day breakfast diner and sports counter directly off Track 1.',
        victorianTip: 'Crisp eggs, bacon, and coffee without losing sight of the platform.',
        budgetTier: 'under-25',
        priceEstimate: '$12 – $22',
        websiteUrl: 'https://huntingtonstationdiner.com'
      },
      {
        name: 'Southdown Coffee',
        category: 'coffee',
        walkingMinutes: 12,
        description: 'Award-winning local craft coffee roastery with artisanal espresso.',
        victorianTip: 'Precision-roasted beans prepared to exacting standards.',
        budgetTier: 'under-25',
        priceEstimate: '$5 – $11',
        websiteUrl: 'https://southdowncoffee.com'
      },
      {
        name: 'Prime: An American Kitchen & Bar',
        category: 'food',
        walkingMinutes: 20,
        description: 'Waterfront steakhouse and raw bar overlooking Huntington Harbor.',
        victorianTip: 'Grand steaks and oysters suited for celebratory banquets.',
        budgetTier: '50-plus',
        priceEstimate: '$70 – $130',
        websiteUrl: 'https://restaurantprime.com'
      },
      {
        name: 'The Paramount Theater',
        category: 'culture',
        walkingMinutes: 16,
        description: 'Premier concert venue hosting world-class musical and comedy acts.',
        victorianTip: 'A theater of marvelous spectacle and acoustics in the village.',
        budgetTier: '50-plus',
        priceEstimate: '$45 – $95',
        websiteUrl: 'https://paramountny.com'
      },
      {
        name: 'Heckscher Park & Museum of Art',
        category: 'culture',
        walkingMinutes: 15,
        description: 'Landscaped public gardens, pond with swans, and fine art museum.',
        victorianTip: 'Serene walking grounds and classical paintings.',
        budgetTier: 'free',
        priceEstimate: 'Free entry to park',
        websiteUrl: 'https://heckscher.org'
      }
    ]
  },
  {
    id: 'hicksville',
    name: 'Hicksville',
    branch: 'Main Line / Port Jefferson',
    zone: 7,
    accessible: true,
    distanceFromPennMiles: 26.8,
    lat: 40.76717491,
    lon: -73.52853322,
    stopId: '92',
    attractions: [
      {
        name: 'Hicksville Sweet Shop & Soda Parlor',
        category: 'food',
        walkingMinutes: 4,
        description: 'Historic vintage confectionery serving homemade ice cream and sodas since 1925.',
        victorianTip: 'Fizzy soda fountain phosphates and rich hand-dipped chocolates.',
        budgetTier: 'under-25',
        priceEstimate: '$6 – $14',
        websiteUrl: 'https://facebook.com/hicksvillesweetshop'
      },
      {
        name: 'Chavidi Royal Indian Cuisine',
        category: 'food',
        walkingMinutes: 5,
        description: 'Authentic rich curries, tandoori grills, and warm naan bread.',
        victorianTip: 'A feast of aromatic spices and hot breads.',
        budgetTier: '25-50',
        priceEstimate: '$25 – $40',
        websiteUrl: 'https://chavidi.com'
      },
      {
        name: 'Cantiague Park',
        category: 'nature',
        walkingMinutes: 16,
        description: 'Sprawling county park with open green walking paths.',
        victorianTip: 'Expansive grassy commons for fresh air.',
        budgetTier: 'free',
        priceEstimate: 'Free',
        websiteUrl: 'https://nassaucountyny.gov/parks'
      }
    ]
  },
  {
    id: 'mineola',
    name: 'Mineola',
    branch: 'Main Line',
    zone: 4,
    accessible: true,
    distanceFromPennMiles: 20.6,
    lat: 40.74034743,
    lon: -73.64086293,
    stopId: '132',
    attractions: [
      {
        name: 'Mineola Portuguese Bakery',
        category: 'food',
        walkingMinutes: 5,
        description: 'Famous warm custard tarts (pasteis de nata) and strong Portuguese espresso.',
        victorianTip: 'Flaky custard pastry freshly pulled from the ovens.',
        budgetTier: 'under-25',
        priceEstimate: '$5 – $12',
        websiteUrl: 'https://mineolaportuguesebakery.com'
      },
      {
        name: 'Churrasqueira Bairrada',
        category: 'food',
        walkingMinutes: 6,
        description: 'Traditional wood-charcoal rotisserie meats and seafood platters.',
        victorianTip: 'Hearty charcoal-grilled meats served in generous portions.',
        budgetTier: '25-50',
        priceEstimate: '$25 – $45',
        websiteUrl: 'https://bairradarestaurant.com'
      }
    ]
  },
  {
    id: 'jamaica',
    name: 'Jamaica',
    branch: 'All Branches (Grand Central Hub)',
    zone: 3,
    accessible: true,
    distanceFromPennMiles: 11.2,
    lat: 40.69960817,
    lon: -73.80852987,
    stopId: '102',
    attractions: [
      {
        name: 'Jamaica Station Concourse Cafes & Bakeries',
        category: 'food',
        walkingMinutes: 1,
        description: 'Quick commuter food court with fresh bagels, coffee, and grab-and-go meals.',
        victorianTip: 'Swift refreshments right on the upper mezzanine.',
        budgetTier: 'under-25',
        priceEstimate: '$7 – $15',
        websiteUrl: 'https://new.mta.info'
      },
      {
        name: 'The Door Restaurant (Caribbean Cuisine)',
        category: 'food',
        walkingMinutes: 10,
        description: 'Beloved Caribbean destination known for jerk chicken and oxtail stew.',
        victorianTip: 'Robust, richly spiced stews and island culinary traditions.',
        budgetTier: '25-50',
        priceEstimate: '$25 – $45',
        websiteUrl: 'https://thedoorrestaurantny.com'
      },
      {
        name: 'Rufus King Manor Museum & Park',
        category: 'culture',
        walkingMinutes: 8,
        description: 'Historic 18th-century home of US Constitution signer Rufus King.',
        victorianTip: 'A preserved founding-era manor house amidst the bustling terminal.',
        budgetTier: 'free',
        priceEstimate: 'Free to stroll',
        websiteUrl: 'https://kingmanor.org'
      },
      {
        name: 'AirTrain JFK Terminal Connection',
        category: 'transit',
        walkingMinutes: 2,
        description: 'Automated electric train connecting directly to JFK Airport terminals.',
        victorianTip: 'Elevated railway linking to international flight journeys.',
        budgetTier: 'under-25',
        priceEstimate: '$8.50',
        websiteUrl: 'https://jfkairport.com/to-from/airtrain'
      }
    ]
  },
  {
    id: 'grand-central-madison',
    name: 'Grand Central Madison',
    branch: 'East Side Access Hub (Manhattan)',
    zone: 1,
    accessible: true,
    distanceFromPennMiles: 0,
    lat: 40.755162,
    lon: -73.975455,
    stopId: '349',
    attractions: [
      {
        name: 'Grand Central Oyster Bar & Restaurant',
        category: 'food',
        walkingMinutes: 4,
        description: 'Iconic vaulted dining hall serving fresh Atlantic oysters and pan roasts since 1913.',
        victorianTip: 'Dine beneath tiled archways upon fresh Bluepoint oysters.',
        budgetTier: '50-plus',
        priceEstimate: '$55 – $95',
        websiteUrl: 'https://oysterbarny.com'
      },
      {
        name: 'Grand Central Market & Cafes',
        category: 'food',
        walkingMinutes: 3,
        description: 'European-style indoor food market with artisan cheese, breads, and espresso bars.',
        victorianTip: 'Commuter provisions of the highest artisanal quality.',
        budgetTier: 'under-25',
        priceEstimate: '$12 – $24',
        websiteUrl: 'https://grandcentralterminal.com/market'
      },
      {
        name: 'Summit One Vanderbilt',
        category: 'culture',
        walkingMinutes: 3,
        description: 'Multi-sensory glass observatory rising 1,200 feet over Midtown Manhattan.',
        victorianTip: 'A glass observation tower soaring into the clouds above 42nd Street.',
        budgetTier: '50-plus',
        priceEstimate: '$52 – $75',
        websiteUrl: 'https://summitov.com'
      },
      {
        name: 'Bryant Park & New York Public Library',
        category: 'nature',
        walkingMinutes: 7,
        description: 'Lush public garden with lawn seating, reading rooms, and free public exhibits.',
        victorianTip: 'Guarded by marble lions, housing millions of parchment volumes.',
        budgetTier: 'free',
        priceEstimate: 'Free',
        websiteUrl: 'https://bryantpark.org'
      }
    ]
  },
  {
    id: 'penn-station',
    name: 'Penn Station',
    branch: 'West Side Manhattan Hub',
    zone: 1,
    accessible: true,
    distanceFromPennMiles: 0,
    lat: 40.75058844,
    lon: -73.99358408,
    stopId: '237',
    attractions: [
      {
        name: 'Moynihan Food Hall & Jacob\'s Pickles',
        category: 'food',
        walkingMinutes: 1,
        description: 'Gourmet food hall beneath Moynihan\'s historic skylights with hot pastrami and biscuits.',
        victorianTip: 'A glass-vaulted cathedral of steel and premier dining.',
        budgetTier: '25-50',
        priceEstimate: '$20 – $38',
        websiteUrl: 'https://moynihantrainhall.nyc'
      },
      {
        name: 'Blue Bottle Coffee (Moynihan Concourse)',
        category: 'coffee',
        walkingMinutes: 2,
        description: 'Fast artisanal drip coffee and espresso right outside the track boarding gates.',
        victorianTip: 'Steaming espresso before boarding the evening express.',
        budgetTier: 'under-25',
        priceEstimate: '$6 – $11',
        websiteUrl: 'https://bluebottlecoffee.com'
      },
      {
        name: 'Ci Siamo (Hudson Yards Fine Dining)',
        category: 'food',
        walkingMinutes: 8,
        description: 'Critically acclaimed wood-fired Italian restaurant and hand-rolled pasta bar.',
        victorianTip: 'Wood-fired Italian cuisine of exceptional elegance.',
        budgetTier: '50-plus',
        priceEstimate: '$65 – $110',
        websiteUrl: 'https://cisiamonyc.com'
      },
      {
        name: 'The High Line Elevated Park',
        category: 'nature',
        walkingMinutes: 9,
        description: 'Public park built on a historic freight rail line elevated above Manhattan streets.',
        victorianTip: 'Former locomotive tracks reclaimed by botanical gardens.',
        budgetTier: 'free',
        priceEstimate: 'Free',
        websiteUrl: 'https://thehighline.org'
      }
    ]
  },
  {
    id: 'atlantic-terminal',
    name: 'Atlantic Terminal',
    branch: 'Brooklyn Branch',
    zone: 1,
    accessible: true,
    distanceFromPennMiles: 10.5,
    lat: 40.68359596,
    lon: -73.97567112,
    stopId: '241',
    attractions: [
      {
        name: 'Shake Shack & Atlantic Concourse Dining',
        category: 'food',
        walkingMinutes: 2,
        description: 'Classic burgers, shakes, and fast commuter meals in the shopping pavilion.',
        victorianTip: 'Quick burgers and drinks right off the subway connection.',
        budgetTier: 'under-25',
        priceEstimate: '$12 – $20',
        websiteUrl: 'https://shakeshack.com'
      },
      {
        name: 'Barclays Center',
        category: 'culture',
        walkingMinutes: 2,
        description: 'Major arena for NBA games, world concerts, and entertainment.',
        victorianTip: 'A landmark arena clad in weathered steel.',
        budgetTier: '50-plus',
        priceEstimate: '$60+',
        websiteUrl: 'https://barclayscenter.com'
      },
      {
        name: 'Prospect Park & Brooklyn Public Library',
        category: 'nature',
        walkingMinutes: 16,
        description: 'Historic 526-acre park designed by Olmsted & Vaux with grand monument arches.',
        victorianTip: 'Expansive scenic grounds and historic woodlands.',
        budgetTier: 'free',
        priceEstimate: 'Free',
        websiteUrl: 'https://prospectpark.org'
      }
    ]
  },
  {
    id: 'ronkonkoma',
    name: 'Ronkonkoma',
    branch: 'Main Line / Ronkonkoma Branch',
    zone: 9,
    accessible: true,
    distanceFromPennMiles: 48.5,
    lat: 40.80808613,
    lon: -73.10594023,
    stopId: '179',
    attractions: [
      {
        name: 'Flanagan\'s Celtic Pub & Grill',
        category: 'food',
        walkingMinutes: 5,
        description: 'Irish pub offering hot shepherd\'s pie, sandwiches, and draft ales.',
        victorianTip: 'A warm pub serving wholesome fare near the main depot.',
        budgetTier: 'under-25',
        priceEstimate: '$15 – $26',
        websiteUrl: 'https://flanaganspub.net'
      },
      {
        name: 'Lake Ronkonkoma County Park',
        category: 'nature',
        walkingMinutes: 16,
        description: 'Freshwater glacial lake with walking paths and fishing piers.',
        victorianTip: 'A historic natural lake steeped in Long Island folklore.',
        budgetTier: 'free',
        priceEstimate: 'Free',
        websiteUrl: 'https://suffolkcountyny.gov/parks'
      }
    ]
  }
];

export interface AccountRoleItem {
  role: CommuterRole;
  title: string;
  discount: number;
  badge: string;
  description: string;
  note?: string;
  linkText?: string;
  linkUrl?: string;
  isConcept?: boolean;
  perks: string[];
}

export const ACCOUNT_ROLES: AccountRoleItem[] = [
  {
    role: 'standard',
    title: 'Standard Fare',
    discount: 0,
    badge: 'STANDARD FARE',
    description: 'Standard adult fare with no flat discount. Valid across all peak and off-peak runs.',
    perks: [
      'Standard single and round-trip MTA LIRR tariff',
      'Valid on all steam and electric passenger lines',
      'Purchasable at ticket windows, ticket machines, and in the TrainTime app'
    ]
  },
  {
    role: 'senior',
    title: 'Senior 65+ / Disability / Medicare',
    discount: 50,
    badge: 'SENIOR 65+ / REDUCED FARE',
    description: 'Half of the one-way peak fare, valid at all times except weekday AM peak trains arriving in NYC (6 AM - 10 AM).',
    note: 'Requires ID (65+ proof, Reduced-Fare MetroCard, paratransit card, or Medicare card).',
    linkText: 'MTA Reduced-Fare Guidelines',
    linkUrl: 'https://new.mta.info/fares/reduced-fare',
    perks: [
      '50% off regular one-way fares (half peak fare)',
      'Valid at all times except weekday AM peak westbound (6-10 AM)',
      'Requires ID (65+ proof, Reduced-Fare MetroCard, paratransit card, or Medicare card)'
    ]
  },
  {
    role: 'child',
    title: 'Child under 5',
    discount: 100,
    badge: 'CHILD UNDER 5 (FREE)',
    description: 'Children under 5 years old ride free at all times when accompanied by a fare-paying adult.',
    note: 'Up to 4 children under 5 ride free per paying adult. For family fares and ages 5–17, see mta.info/fares.',
    linkText: 'See mta.info/fares for family fares & ages 5-17',
    linkUrl: 'https://new.mta.info/fares',
    perks: [
      'Rides free at all times with paying adult',
      'Up to 4 children under 5 per adult',
      'No ticket purchase required for young children'
    ]
  },
  {
    role: 'frequent',
    title: 'Frequent commuter',
    discount: 0,
    badge: 'FREQUENT COMMUTER',
    description: 'Monthly and Ten-Trip tickets save money; see mta.info/fares.',
    note: 'No flat discount. See mta.info/fares for monthly and multi-trip savings.',
    linkText: 'See mta.info/fares for Monthly & Ten-Trip rates',
    linkUrl: 'https://new.mta.info/fares',
    perks: [
      'Monthly Unlimited passes offer substantial savings for frequent riders',
      'Ten-Trip ticket bundles provide flexibility and discounts',
      'Consult mta.info/fares for customized zone-by-zone pricing'
    ]
  },
  {
    role: 'student',
    title: 'SBU Student (Demo Concept)',
    discount: 0,
    badge: 'CONCEPT DISCOUNT',
    description: 'Concept discount (demo only, not an MTA program). Never applied to real fares.',
    note: 'Concept discount (demo only, not an MTA program). Does not apply to real fares or appear in the header badge.',
    isConcept: true,
    perks: [
      'Concept discount (demo only, not an MTA program)',
      'Real ticket fares remain at official MTA tariff rates'
    ]
  }
];
