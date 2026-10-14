const SIZE_CLASSES = {
  small: 'h-9 w-9',
  medium: 'h-10 w-10',
};

export default function Avatar(props) {
  const sizeClass = SIZE_CLASSES[props.size] || SIZE_CLASSES.medium;

  return (
    <div
      className={`flex ${sizeClass} items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white`}
      title={props.title}
    >
      {props.label}
    </div>
  );
}
