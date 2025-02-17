import ContactLink from './contactLink';

const ContactLinks = () => {
  return (
    <div className="w-fit flex flex-col p-5 text-xl self-start">
      <ContactLink linksTo="mailto:Konrad.Knecht@gmail.com" text="Email" />
      <ContactLink openNewTab linksTo="https://www.linkedin.com/in/konrad-knecht/" text="LinkedIn" />
      <ContactLink openNewTab linksTo="https://github.com/TrippWasTaken" text="GitHub" />
    </div>
  );
};

export default ContactLinks;
