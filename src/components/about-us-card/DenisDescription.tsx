export default function AlexDescription(props: { full: boolean }): JSX.Element {
  if (props.full) {
    return (
      <div>
        <p>
          My name is Denis Yeresko and I am a beginner developer focused on the frontend. My goal is to become a highly
          qualified web development specialist and continue to develop my knowledge and skills in programming.{' '}
        </p>
        <p>
          I entered the university, where I studied for two years, but at some point I realized that I needed more
          practice and real projects. I decided to take an academic leave and focus on self-development.{' '}
        </p>
        <p>
          Over time, I realized that I was attracted to frontend development, and I decided to focus on this direction.
          I enrolled in the JavaScript course from RS School. I wanted to expand my horizons and learn how to work with
          modern frontend technologies.{' '}
        </p>
        <p>
          The learning process at RS School was a real discovery for me. I began to better understand how the
          interaction between the user and the web application is built.
        </p>
        <p>
          One of my main motivations is the opportunity to solve complex problems and create solutions that make web
          applications more convenient and functional for users. I always enjoy solving logical problems and encounter
          them at every stage of development. The complexity of the tasks does not scare me, on the contrary, it
          motivates me to delve deeper into the problem and find the most elegant solution. I strive to develop this
          quality in the future in order to effectively solve the problems I encounter at work.
        </p>
        <ul className="mt-10">
          <h2>Contributions</h2>
          <li>‣ Integration with CommerceTools SDK</li>
          <li>‣ Integrate Login Form with CommerceTools</li>
          <li>‣ Implement Authentication Error Handling</li>
          <li>‣ Redirect Users After Successful Login</li>
          <li>‣ Redirect Authenticated Users from Login Page</li>
          <li>‣ Handle Authentication Token Management</li>
          <li>‣ Integrate Registration Form with CommerceTools</li>
          <li>‣ Implement Registration Error Handling</li>
          <li>‣ Present User&apos;s Personal Information on User Profile Page</li>
          <li>‣ Implement Edit Mode for Updating User Details on Profile Page</li>
          <li>‣ Implement Personal Information and Email Edit in User Profile Page</li>
          <li>‣ Implement Password Change in User Profile Page</li>
          <li>‣ Manage Addresses 🏡 in User Profile Page with commercetools API</li>
          <li>‣ Implement Remove from Cart&quot; Feature</li>
          <li>‣ Implement Total Cost Recalculation</li>
          <li>‣ Implement Empty Cart Message</li>
          <li>‣ Add Catalog Link in Empty Cart</li>
          <li>‣ Implement Promo Code Feature</li>
          <li>‣ Add Clear Shopping Cart Feature</li>
          <li>‣ Create Development Team Introduction</li>
          <li>‣ Add RS School Logo and Link</li>
        </ul>
      </div>
    );
  }
  return (
    <div>
      <p>
        My name is Denis Yeresko and I am a beginner developer focused on the frontend. My goal is to become a highly
        qualified web development specialist and continue to develop my knowledge and skills in programming.{' '}
      </p>
      <p>
        I entered the university, where I studied for two years, but at some point I realized that I needed more
        practice and real projects. I decided to take an academic leave and focus on self-development.{' '}
      </p>
      <p>Over time, I realized that I was attracted to...</p>
    </div>
  );
}
