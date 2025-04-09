"use client";
import ContactForm from "@/components/contacts/ContactForm";

export default function Contacts() {
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <ContactForm />
      </div>
    </div>
  );
}

const styles = {
  container: "pt-16",
  innerContainer: "p-8 bg-white",
};
