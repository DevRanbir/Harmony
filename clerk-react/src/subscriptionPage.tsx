export default function SubscriptionPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Choose Your Subscription</h1>
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ border: "1px solid gray", padding: "20px", borderRadius: "10px" }}>
          <h2>Free</h2>
          <p>Basic access to the app.</p>
          <button>Choose Free</button>
        </div>

        <div style={{ border: "1px solid gray", padding: "20px", borderRadius: "10px" }}>
          <h2>Pro</h2>
          <p>Extra features and priority support.</p>
          <button>Choose Pro</button>
        </div>

        <div style={{ border: "1px solid gray", padding: "20px", borderRadius: "10px" }}>
          <h2>Enterprise</h2>
          <p>For large teams with advanced needs.</p>
          <button>Contact Us</button>
        </div>
      </div>
    </div>
  );
}
