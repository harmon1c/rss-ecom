export default function AlexDescription(props: { full: boolean }): JSX.Element {
  if (props.full) {
    return (
      <div>
        <p>
          Hi, I&apos;m Alex, a front-end developer with a passion for building complex systems and interactive
          interfaces.
        </p>
        <p>
          With a background in mechanical engineering and previous experience as an associate professor at the Odesa
          National Academy of Food Technologies, I bring an engineer&apos;s precision and a systematic approach to web
          development. A lifelong fascination with innovation and creating new things led me to programming, where I
          discovered endless possibilities for bringing ideas to life.
        </p>
        <p>
          My journey into tech began with The Rolling Scopes course, which guided me from the fundamentals of Git to
          tackling algorithmic challenges. My first major project, a Black Jack game, was a practical playground for
          applying these new skills—from DOM manipulation and Local Storage to using AI for asset generation. As I
          progressed, I embraced modern tools like Webpack and key development principles (KISS, DRY) that now guide me
          in writing clean, efficient code.
        </p>
        <p>
          Looking ahead, my goal is to move beyond websites to architecting complex web applications. I aspire to merge
          my engineering expertise with my new passion to build a unique product: a simulation application for CO2
          refrigeration systems.
        </p>
        <ul className="mt-10">
          <h2>Contributions</h2>
          <li>‣ Remove Labeler workflow</li>
          <li>‣ Add Navigation to Registration Page</li>
          <li>‣ Add Links to Functional Pages</li>
          <li>‣ Implement Correct Page Transitions</li>
          <li>‣ Implement 404 Page</li>
          <li>‣ Navigation for Unauthorized Users</li>
          <li>‣ Main Page Access for All Users</li>
          <li>‣ Logout Functionality for Authorized Users</li>
          <li>‣ Integrate React Query for State Management</li>
          <li>‣ Write Unit Tests for Authentication Components</li>
          <li>‣ Write Unit Tests for API Integration</li>
          <li>‣ Ensure 25% Test Coverage</li>
          <li>‣ Update Readme</li>
          <li>‣ Update Docs</li>
          <li>‣ Fetch and Display Product List using Commercetools API</li>
          <li>‣ Display Prices with and Without Discount for Discounted Products</li>
          <li>‣ Implement Robust Filtering Options for Product List Using commercetools API</li>
          <li>‣ Implement Sorting Functionality for Product List Using commercetools API</li>
          <li>‣ Implement Search Functionality for Product List Using commercetools API</li>
          <li>‣ Redirect to Detailed Product Page</li>
          <li>‣ Implement Category 🏷️ and Breadcrumb Navigation 🍞</li>
          <li>‣ Implement Routing 🚦 and Browser Navigation 🌐 for Catalog and Product Detail Pages</li>
          <li>‣ Implement Routing 🚦 and Browser Navigation 🌐 for User Profile Page</li>
          <li>‣ Implement Navigation 🚦 to Catalog Page in Header</li>
          <li>‣ Implement User Profile Navigation 🚦 in Header</li>
          <li>‣ Add Add to Cart Button to Product Cards</li>
          <li>‣ Integrate Shopping Cart with CommerceTools API</li>
          <li>‣ Implement Product List Performance Optimization</li>
          <li>‣ Implement Basket Page Routing</li>
          <li>‣ Implement About Us Page Routing</li>
          <li>‣ Add Basket Icon to Header</li>
          <li>‣ Add About Us Link to Header</li>
        </ul>
      </div>
    );
  }
  return (
    <div>
      <p>
        Hi, I&apos;m Alex, a front-end developer with a passion for building complex systems and interactive interfaces.
      </p>
      <p>
        With a background in mechanical engineering and previous experience as an associate professor at the Odesa
        National Academy of Food Technologies, I bring an engineer&apos;s precision and a systematic approach to web
        development. A lifelong fascination with innovation and creating new things led me to programming, where I
        discovered endless possibilities for bringing ideas to life...
      </p>
    </div>
  );
}
