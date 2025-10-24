import React from 'react';

const TicketFooterInfo: React.FC = () => {
    const importantInfo = [
        "You must web check-in on the airline website and obtain a boarding pass.",
        "Reach the terminal at least 2 hours prior to the departure for domestic flight and 4 hours prior to the departure of international flight.",
        "For departure terminal please check with the airline first.",
        "Date & Time is calculated based on the local time of the city/destination.",
        "Use the Airline PNR for all Correspondence directly with the Airline.",
        "For rescheduling/cancellation within 4 hours of the departure time contact the airline directly.",
        "Your ability to travel is at the sole discretion of the airport authorities and we shall not be held responsible."
    ];

    return (
        <section className="mt-6 pt-4 border-t dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">Important Information</h3>
            <ol className="list-decimal list-inside space-y-1">
                {importantInfo.map((info, index) => (
                    <li key={index}>{info}</li>
                ))}
            </ol>
        </section>
    );
};

export default TicketFooterInfo;
