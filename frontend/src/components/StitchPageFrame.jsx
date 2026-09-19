import { useLocation } from "react-router-dom";

export default function StitchPageFrame({ file, title }) {
  const location = useLocation();

  return (
    <iframe
      key={location.pathname}
      className="stitch-frame"
      title={title}
      src={`/stitch-pages/${file}/code.html`}
    />
  );
}
