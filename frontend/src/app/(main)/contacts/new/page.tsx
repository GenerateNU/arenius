"use client";
import ContactForm from "@/components/contacts/ContactForm";

export default function Contacts() {
  return (
    <div className={styles.container}>
      <ContactForm />
    </div>
  );
}

const styles = {
  container: "p-8 pb-20 gap-16 sm:p-20 flex-1",
};
