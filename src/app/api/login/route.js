export async function POST(request) {
  const { email, password } = await request.json();

  // Replace with actual authentication logic
  const isValid = email === "user@example.com" && password === "password";

  if (isValid) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: "Invalid credentials",
    }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}
