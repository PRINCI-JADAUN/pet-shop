function Icon({ value }) {
  return <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: value }} />;
}

export default Icon;
