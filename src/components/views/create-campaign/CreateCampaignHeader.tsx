const steps = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <mask
            id="mask0_832_2822"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="32"
            height="32"
            style={{ maskType: "alpha" }}
          >
            <rect width="32" height="32" fill="#D9D9D9" />
          </mask>
          <g mask="url(#mask0_832_2822)">
            <path
              d="M23.0967 24.4744L22.3764 23.754C22.219 23.5967 22.0313 23.518 21.8133 23.518C21.5956 23.518 21.408 23.5967 21.2507 23.754C21.0933 23.9111 21.0147 24.0952 21.0147 24.3064C21.0147 24.5175 21.0933 24.7017 21.2507 24.859L22.4737 26.082C22.6566 26.2649 22.8665 26.3564 23.1033 26.3564C23.34 26.3564 23.5498 26.2649 23.7327 26.082L26.748 23.1207C26.9053 22.9634 26.9861 22.7778 26.9903 22.564C26.9946 22.3505 26.9138 22.1608 26.748 21.995C26.5907 21.8377 26.4009 21.759 26.1787 21.759C25.9565 21.759 25.7668 21.8377 25.6097 21.995L23.0967 24.4744ZM9.51235 11.8204H22.4863C22.7701 11.8204 23.0078 11.7247 23.1994 11.5334C23.3907 11.3418 23.4863 11.1042 23.4863 10.8207C23.4863 10.5282 23.3907 10.2885 23.1994 10.1014C23.0078 9.91424 22.7701 9.82069 22.4863 9.82069H9.51235C9.22857 9.82069 8.9909 9.91635 8.79935 10.1077C8.60802 10.2992 8.51235 10.5369 8.51235 10.8207C8.51235 11.1042 8.60802 11.3418 8.79935 11.5334C8.9909 11.7247 9.22857 11.8204 9.51235 11.8204Z"
              fill="#478C5C"
            />
          </g>
        </svg>
      ),
      label: "Crea tu campaña",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <mask
            id="mask0_832_2837"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="32"
            height="32"
            style={{ maskType: "alpha" }}
          >
            <rect width="32" height="32" fill="#D9D9D9" />
          </mask>
          <g mask="url(#mask0_832_2837)">
            <path
              d="M16 11.923C14.8478 11.923 13.8675 11.5188 13.059 10.7104C12.2506 9.90169 11.8464 8.92136 11.8464 7.76936C11.8464 6.61713 12.2506 5.6368 13.059 4.82836C13.8675 4.01969 14.8478 3.61536 16 3.61536C17.1522 3.61536 18.1326 4.01969 18.941 4.82836C19.7495 5.6368 20.1537 6.61713 20.1537 7.76936C20.1537 8.92136 19.7495 9.90169 18.941 10.7104C18.1326 11.5188 17.1522 11.923 16 11.923Z"
              fill="#478C5C"
            />
          </g>
        </svg>
      ),
      label: "Verificala",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <mask
            id="mask0_832_2827"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="32"
            height="32"
            style={{ maskType: "alpha" }}
          >
            <rect width="32" height="32" fill="#D9D9D9" />
          </mask>
          <g mask="url(#mask0_832_2827)">
            <path
              d="M14.6003 17.4207L12.4363 15.277C12.2516 15.0923 12.0229 14.9979 11.7503 14.9937C11.4776 14.9894 11.2378 15.0907 11.0309 15.2973C10.8378 15.4907 10.7413 15.7249 10.7413 16C10.7413 16.2751 10.8378 16.5093 11.0309 16.7027L13.7566 19.4283C13.9977 19.6692 14.2789 19.7897 14.6003 19.7897C14.9216 19.7897 15.2028 19.6692 15.4439 19.4283L20.9696 13.9027C21.1678 13.7042 21.2656 13.4721 21.2629 13.2063C21.2605 12.9406 21.1627 12.7042 20.9696 12.4973C20.7627 12.2907 20.5251 12.1839 20.2566 12.177C19.9884 12.1701 19.7508 12.2701 19.5439 12.477L14.6003 17.4207Z"
              fill="#478C5C"
            />
          </g>
        </svg>
      ),
      label: "Compártela",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 11.923C14.8478 11.923 13.8675 11.5188 13.059 10.7104C12.2506 9.90169 11.8464 8.92136 11.8464 7.76936C11.8464 6.61713 12.2506 5.6368 13.059 4.82836C13.8675 4.01969 14.8478 3.61536 16 3.61536C17.1522 3.61536 18.1326 4.01969 18.941 4.82836C19.7495 5.6368 20.1537 6.61713 20.1537 7.76936C20.1537 8.92136 19.7495 9.90169 18.941 10.7104C18.1326 11.5188 17.1522 11.923 16 11.923Z"
            fill="#478C5C"
          />
        </svg>
      ),
      label: "Gestiona los fondos",
    },
  ]
  
  export function CreateCampaignHeader() {
    return (
      <div className="relative bg-[#f5f7e9] py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Cuenta tu historia e inspira</h1>
            <p className="text-xl text-gray-600">
              Personaliza tu campaña y comparte tu historia de forma gratuita. Sigue estos simples pasos y empieza a
              recaudar fondos.
            </p>
          </div>
  
          <div className="max-w-4xl mx-auto relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-[15%] right-[15%] h-[1px] bg-[#478C5C]" />
  
            {/* Steps */}
            <div className="relative z-10 flex justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#f5f7e9] border-2 border-[#478C5C] flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  