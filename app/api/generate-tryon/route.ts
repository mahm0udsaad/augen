// Note: The Gemini-based try-on flow now lives in the server action at app/actions/try-on.ts.
// This API route stays as a guard for any legacy clients and to provide a helpful message.

export async function POST(request: Request) {
  return Response.json(
    {
      message: "Virtual try-on requests should use the server action at `/app/actions/try-on.ts`.",
      status: "deprecated"
    },
    { status: 200 }
  )
}

