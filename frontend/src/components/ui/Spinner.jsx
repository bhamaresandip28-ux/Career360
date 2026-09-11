import Loading from './Loading';

export default function Spinner({ size = 'md', label }) {
  return <Loading size={size} label={label || ''} fullScreen={false} />;
}
