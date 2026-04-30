import React from 'react';

const asciiArtMap: Record<string, string> = {
  about: `
      ___  ____  ____  __  __  ____ 
     / _ \\(  _ \\(  _ \\(  )(  )(_  _)
    / __ \\ ) _ < ) (_) ))(__)(   )(  
   (_/ \\_)(____/(____/(____) (__) 
  `,
  faq: `
     ____   __     __   
    (  __) / _\\  /  \\  
     ) _) /    \\(  O ) 
    (__)  \\_/\\_/ \\___\\ 
  `,
  pricing: `
    ____  ____  __  ___  __  _  _  ___ 
   (  _ \\(  _ \\(  )/ __)/  \\( \\( )/ __)
    ) __/ )   / )( \\__ \\  O ))  ( \\__ \\
   (__)  (__\\_)(__)(___/\\__/(_)\\_)(___/
  `,
  privacy: `
    ____  ____  __  _  _  __    ___  _  _ 
   (  _ \\(  _ \\(  )/ )( \\/ _\\  / __)( \\/ )
    ) __/ )   / )( \\ \\/ /    \\( (__  )  / 
   (__)  (__\\_)(__) \\__/\\_/\\_/ \\___)(__/  
  `,
  terms: `
    ____  ____  ____  __  __  ____ 
   (_  _)(  __)(  _ \\(  \\/  )/ ___)
     )(   ) _)  )   / )    ( \\___ \\
    (__) (____)(__\\_)(_/\\/\\_)(____/
  `
};

const pagesData: Record<string, { title: string, content: React.ReactNode }> = {
  about: {
    title: 'About Canto',
    content: (
      <div>
        <p>Welcome to <strong>Canto</strong>.</p>
        <p>
          We believe in a world where curiosity never hits a dead end. Our mission is to provide an
          infinite, real-time generated encyclopedia where every word is a doorway to new knowledge.
        </p>
        <h3 style={{ marginTop: '2rem' }}>How It Works</h3>
        <p>
          Unlike traditional encyclopedias that rely on pre-written articles, Canto leverages cutting-edge
          AI (Gemini) to generate and stream definitions and articles on the fly. You search, and the knowledge is
          created instantly for you.
        </p>
        <h3 style={{ marginTop: '2rem' }}>Our Vision</h3>
        <p>
          To map out the entirety of human curiosity, making learning an endless, interactive journey.
          No bounds, no missing pages, just pure exploration.
        </p>
      </div>
    )
  },
  pricing: {
    title: 'Pricing',
    content: (
      <div>
        <p>Canto is designed to be accessible to everyone.</p>
        <h3 style={{ marginTop: '2rem' }}>100% Free Forever</h3>
        <p>
          We do not charge for searching, reading, or generating ASCII art. There are no premium tiers,
          no hidden fees, and no subscriptions. Explore the infinite wiki without limits.
        </p>
      </div>
    )
  },
  faq: {
    title: 'Frequently Asked Questions',
    content: (
      <div>
        <h3 style={{ marginTop: '2rem' }}>What is Canto?</h3>
        <p>
          Canto is an infinite, real-time generated encyclopedia. Every topic you can imagine has a unique
          definition and ASCII art representation generated on the fly.
        </p>
        
        <h3 style={{ marginTop: '2rem' }}>How does it generate content so fast?</h3>
        <p>
          Canto relies on Google models under the hood (specifically Gemini) through a streaming 
          architecture to provide real-time updates as the content is inferred.
        </p>
        
        <h3 style={{ marginTop: '2rem' }}>Can I contribute?</h3>
        <p>
          Since the content is generated programmatically, there's no traditional editing feature. 
          However, you can explore new terms that haven't been generated before simply by typing them.
        </p>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div>
        <p>Your privacy matters to us. Here's a simple, jargon-free breakdown of how we handle your data.</p>
        <h3 style={{ marginTop: '2rem' }}>1. What We Collect</h3>
        <p>
          We collect the search queries you enter to generate the content you request. We do not require you
          to create an account to use the basic features, which means your searches are not tied to your personal identity.
        </p>
        <h3 style={{ marginTop: '2rem' }}>2. How We Use It</h3>
        <p>
          Your queries are strictly used to interact with our AI providers (like Google's Gemini) to return the
          definitions you see. We also use generic usage data to understand how the platform is used and to improve it.
        </p>
        <h3 style={{ marginTop: '2rem' }}>3. What We Don't Do</h3>
        <p>
           We do <strong>not</strong> sell your personal data to third parties. 
           We do <strong>not</strong> track your browsing outside of this application.
        </p>
        <h3 style={{ marginTop: '2rem' }}>4. Third-Party Services</h3>
        <p>
          Since we use Google's Gemini API, your search terms are sent to Google for processing. Please refer to
          Google's own privacy policy to understand how they handle API request data.
        </p>
      </div>
    )
  },
  terms: {
    title: 'Terms & Conditions',
    content: (
      <div>
        <p>By using Canto, you agree to these simple rules.</p>
        <h3 style={{ marginTop: '2rem' }}>1. Usage</h3>
        <p>
          Canto is provided for educational, informational, and entertainment purposes. 
          The content is generated by AI and may sometimes be inaccurate, incomplete, or nonsensical.
        </p>
        <h3 style={{ marginTop: '2rem' }}>2. No Warranties</h3>
        <p>
          We provide the service "as is." We don't guarantee that the service will always be up, 
          nor do we guarantee the factual accuracy of any AI-generated article. Always verify important facts 
          with trusted primary sources.
        </p>
        <h3 style={{ marginTop: '2rem' }}>3. Acceptable Use</h3>
        <p>
          Do not use the platform to generate illegal, harmful, or grossly offensive content. We reserve the 
          right to block requests or IP addresses that abuse the system limits or attempt to compromise our infrastructure.
        </p>
        <h3 style={{ marginTop: '2rem' }}>4. Changes to Terms</h3>
        <p>
          We may update these terms as the platform evolves. Continued use of the platform implies acceptance 
          of the current terms.
        </p>
      </div>
    )
  }
};

interface StaticPageProps {
  pageId: string;
}

const StaticPage: React.FC<StaticPageProps> = ({ pageId }) => {
  const page = pagesData[pageId] || { title: 'Page Not Found', content: <p>We could not find the page you are looking for.</p> };
  const art = asciiArtMap[pageId] || '';

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', textTransform: 'capitalize', letterSpacing: '0.1em' }}>
        {page.title}
      </h2>
      {art && (
        <pre className="ascii-art living-ascii" style={{ color: '#555', marginBottom: '2rem', overflowX: 'auto' }}>
          {art}
        </pre>
      )}
      <div style={{ lineHeight: '1.8', color: '#333' }}>
        {page.content}
      </div>
    </div>
  );
};

export default StaticPage;
