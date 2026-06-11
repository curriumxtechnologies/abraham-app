import { useNavigate } from 'react-router-dom';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  to, 
  className = '', 
  disabled = false,
  type = 'button',
  icon: Icon,
  iconPosition = 'left'
}) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    if (to) {
      navigate(to);
    }
  };

  const baseStyles = 'relative w-full py-4 px-6 rounded-[20px] font-inter font-semibold text-base transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-[#0E2F76] text-white shadow-lg shadow-[#0E2F76]/20 hover:bg-[#0a2560] active:bg-[#081e4d]',
    secondary: 'bg-white text-[#0E2F76] border-2 border-[#0E2F76] hover:bg-[#0E2F76]/5 active:bg-[#0E2F76]/10',
    outline: 'bg-transparent text-[#0E2F76] border-2 border-[#AAC0E1] hover:border-[#0E2F76] hover:bg-[#0E2F76]/5',
    ghost: 'bg-transparent text-[#0E2F76] hover:bg-[#0E2F76]/5',
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {Icon && iconPosition === 'left' && <Icon size={20} strokeWidth={2} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={20} strokeWidth={2} />}
    </button>
  );
};

export default Button;