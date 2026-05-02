
export async function POST(request: Request) {
    const { username, password } = await request.json();
    console.log("Received signup data:", { username, password });
    return new Response(JSON.stringify({ message: "Signup successful" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}