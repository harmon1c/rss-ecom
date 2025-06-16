export default function AlexDescription(props: { full: boolean }): JSX.Element {
  if (props.full) {
    return (
      <div>
        <p>Hi everyone!</p>
        <p>
          My name is Yuliia, and I&apos;ve been learning programming for about a year now. I have a Master&apos;s degree
          in Mechanical Engineering and work experience in that field. But, like many people, I realized I wanted to
          change direction - to dive into something more dynamic and modern. That&apos;s how I discovered frontend
          development.
        </p>
        <p>
          What I enjoy the most is seeing how your code turns into something real - how it becomes more than just lines
          of text and numbers. It’s incredibly rewarding to watch your work come to life on the screen.
        </p>
        <p>
          My journey started at RS School, completely from scratch. Over the past year, I&apos;ve gained a solid
          foundation, lots of hands-on practice, and tackled some really interesting challenges. It&apos;s been a long
          road - and there&apos;s still so much more to learn and grow.
        </p>
        <p>
          Our team worked together on this project, and it was a great experience. The guys did an amazing job - we had
          an awesome team spirit.
        </p>
        <p>I was responsible for the registration page, the privacy policy page, and I also worked on bug fixing.</p>
        <p>And now, we&apos;re really excited to present our final project to you.</p>
        <p>Wishing everyone success in your learning journey and future growth.</p>
        <p>Always strive for excellence!</p>
        <ul className="mt-10">
          <h2>Contributions</h2>
          <li>‣ Implement Login Form Validation</li>
          <li>‣ Display Form Validation Error Messages</li>
          <li>‣ Implement Registration Form Validation</li>
          <li>‣ Display Registration Form Validation Errors</li>
          <li>‣ Auto-Login and Redirect After Registration</li>
          <li>‣ Allow Setting Default Address During Registration</li>
          <li>‣ Enable Different Billing and Shipping Addresses</li>
          <li>‣ Add Navigation to Login Page</li>
          <li>‣ Implement Routing for Authentication Pages</li>
          <li>‣ Display Product Price and Sale Price</li>
          <li>‣ Implement Enlarged Image Modal</li>
          <li>‣ Implement Image Slider in Enlarged Image Modal</li>
          <li>‣ Implement Add to Cart on Product Detail Page</li>
          <li>‣ Implement Remove from Cart on Product Detail Page</li>
          <li>‣ Display Basket Items</li>
          <li>‣ Add Product Quantity Modification</li>
          <li>‣ Display Original and Discounted Prices</li>
        </ul>
      </div>
    );
  }
  return (
    <div>
      <p>Hi everyone!</p>
      <p>
        My name is Yuliia, and I&apos;ve been learning programming for about a year now. I have a Master&apos;s degree
        in Mechanical Engineering and work experience in that field. But, like many people, I realized I wanted to
        change direction — to dive into something more dynamic and modern. That&apos;s how I discovered frontend
        development.
      </p>
      <p>What I enjoy the most is seeing how your code turns into something real - how it becomes...</p>
    </div>
  );
}
