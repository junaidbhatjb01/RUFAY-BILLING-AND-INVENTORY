import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-teal-600 dark:text-teal-400">About RuFay</h1>
      
      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        <div>
          <h2 className="text-xl font-semibold">RuFay – Bill Fast. Grow Smart</h2>
          <p className="text-sm text-gray-500">Version: 2.5</p>
        </div>
        
        <p className="border-t pt-4 dark:border-gray-700">
          RuFay is a simple, local-only billing and inventory software designed to run entirely in your web browser.
        </p>
        
        <div className="border-t pt-4 dark:border-gray-700">
          <h3 className="font-semibold">Developer Information:</h3>
          <p><strong>Name:</strong> Junaid Bhat</p>
          <p><strong>Mobile:</strong> +91 9596095740</p>
          <p><strong>Email:</strong> junaidbhat00011@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
