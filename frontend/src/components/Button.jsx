import './Button.css';

const Button = ({ label, onClick, disabled }) => {
  return (
    <button className="btn" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

export default Button;
