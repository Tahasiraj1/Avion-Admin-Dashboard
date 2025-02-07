
// Ship Engine Doesn't allow you to create batches with test API keys... ///


import { NextResponse } from 'next/server';


const SHIP_ENGINE_API_KEY = process.env.TEST_SHIPENGINE_API_KEY;
const SHIP_ENGINE_API_URL = 'https://api.shipengine.com/v1/batches';

export async function POST(req: Request) {
  try {
    const { customerDetails } = await req.json();

    const shipment = {
      carrier_id: "se-1610072", // stamps_com
      service_code: "usps_priority_mail",
      ship_date: new Date().toISOString().split("T")[0],
      ship_from: {
        name: "Avion Ltd.",
        phone: "+1 310-555-1234",
        company_name: "Avion Ltd.",
        address_line1: "1234 Fashion Ave",
        city_locality: "Los Angeles",
        state_province: "CA",
        postal_code: "90015",
        country_code: "US",
        address_residential_indicator: "no",
      },
      ship_to: {
        name: `${customerDetails.firstName} ${customerDetails.lastName}`,
        phone: customerDetails.phoneNumber,
        address_line1: customerDetails.houseNo,
        city_locality: customerDetails.city,
        state_province: customerDetails.state,
        postal_code: customerDetails.postalCode,
        country_code: customerDetails.country,
        address_residential_indicator: "yes",
      },
      packages: [
        {
          weight: {
            value: 1,
            unit: "pound",
          },
          dimensions: {
            height: 6,
            width: 12,
            length: 24,
            unit: "inch",
          },
        },
      ],
      confirmation: "none",
      advanced_options: {
        use_ups_ground_freight_pricing: false
      }
    };

    console.log("Shipment data being sent to ShipEngine:", JSON.stringify(shipment, null, 2));

    if (!SHIP_ENGINE_API_KEY) {
      throw new Error("ShipEngine API key is not defined");
    }

    // Updated batch request with external_batch_id and batch_notes
    const batchRequest = {
      external_batch_id: "unique-batch-id", // Add a unique batch ID
      batch_notes: "Morning Shipments", // Optional notes for the batch
      shipments: [shipment], // Add your shipment
    };

    const response = await fetch(SHIP_ENGINE_API_URL, {
      method: "POST",
      headers: {
        "API-Key": SHIP_ENGINE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(batchRequest),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("ShipEngine API error response:", errorBody);
      throw new Error(`ShipEngine API error: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log("ShipEngine Response:", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating shipping label:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
}


// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const trackingNumber = searchParams.get('tracking_number');
//   const carrierId = searchParams.get('carrier_id');

//   if (!trackingNumber || !carrierId) {
//     return NextResponse.json({ error: 'Missing tracking number or carrier ID' }, { status: 400 });
//   }

//   try {
//     const response = await axios.get(
//       `${SHIP_ENGINE_API_URL}/tracking?carrier_id=${carrierId}&tracking_number=${trackingNumber}`,
//       {
//         headers: {
//           'API-Key': SHIP_ENGINE_API_KEY,
//         },
//       }
//     );

//     return NextResponse.json(response.data);
//   } catch (error) {
//     console.error('ShipEngine API error:', error);
//     return NextResponse.json({ error: 'Error fetching tracking information' }, { status: 500 });
//   }
// }

