const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top left circle */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#AAC0E1] rounded-full opacity-10 animate-[float_6s_ease-in-out_infinite]" />
      
      {/* Top right shape */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#0E2F76] rounded-[40px] rotate-45 opacity-5 animate-[float_8s_ease-in-out_infinite_1s]" />
      
      {/* Middle left shape */}
      <div className="absolute top-1/2 -left-16 w-40 h-40 bg-[#AAC0E1] rounded-full opacity-8 animate-[float_7s_ease-in-out_infinite_2s]" />
      
      {/* Bottom right circle */}
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#0E2F76] rounded-full opacity-5 animate-[float_9s_ease-in-out_infinite_0.5s]" />
      
      {/* Small decorative dot */}
      <div className="absolute top-[30%] right-[10%] w-4 h-4 bg-[#AAC0E1] rounded-full opacity-20 animate-[pulse_3s_ease-in-out_infinite]" />
      
      {/* Another small dot */}
      <div className="absolute top-[70%] left-[15%] w-3 h-3 bg-[#0E2F76] rounded-full opacity-15 animate-[pulse_4s_ease-in-out_infinite_1s]" />
    </div>
  );
};

export default FloatingShapes;