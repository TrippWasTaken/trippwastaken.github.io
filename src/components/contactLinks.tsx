import ContactLink from './contactLink';

const ContactLinks = () => {
  return (
    <div className="w-fit flex flex-col p-5 text-xl self-start">
      <ContactLink linksTo="#" text="Email" />
      <ContactLink linksTo="#" text="LinkedIn" />
      <ContactLink linksTo="#" text="Discord" />
    </div>
  );
};

export default ContactLinks;
