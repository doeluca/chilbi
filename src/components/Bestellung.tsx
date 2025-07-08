
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { generatePdf } from "../utils/generatePdf";

const MENU = [ ... ]; // same full MENU array as before

export default function Bestellung() {
  const [cart, setCart] = useState([]);
  const [tisch, setTisch] = useState("");

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((x) => x.id === item.id);
      if (exists) {
        return prev.map((x) =>
          x.id === item.id ? { ...x, qty: x.qty + 1 } : x
        );
      } else {
        return [...prev, { ...item, qty: 1 }];
      }
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleBestellen = async () => {
    const bestellung = cart.map(item => `${item.qty}× ${item.name}`).join(", ");
    const payload = {
      tisch,
      bestellung,
      total: total.toFixed(2),
    };

    try {
      await fetch("https://script.google.com/macros/s/AKfycbyrMr6YoJObrbh8Fo6pqEAQcLMYnRn1pVSQ58dnKc7BaXC4HavFvm5KhSh7GNUcMQV6/exec", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const invoiceEl = document.getElementById("invoice");
      if (invoiceEl) {
        await generatePdf(invoiceEl, tisch);
      }

      alert(`Bestellung für Tisch ${tisch} wurde gespeichert. Zahlung mit TWINT folgt.`);
      setCart([]);
    } catch (error) {
      alert("Fehler beim Senden der Bestellung.");
      console.error(error);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Online Bestellung</h1>

      <div className="mb-6">
        <p className="mb-2 font-semibold">Bitte Tisch auswählen:</p>
        <Select onValueChange={(value) => setTisch(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Tischnummer wählen" />
          </SelectTrigger>
          <SelectContent>
            {[...Array(20)].map((_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                Tisch {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {MENU.map((section) => (
        <div key={section.category} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{section.category}</h2>
          <div className="grid gap-4">
            {section.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      CHF {item.price.toFixed(2)}
                    </p>
                  </div>
                  <Button onClick={() => addToCart(item)} disabled={!tisch}>
                    +
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <h2 className="text-xl font-semibold mb-2">Dein Warenkorb</h2>
      <div id="invoice">
        {cart.length === 0 ? (
          <p className="text-gray-500">Noch nichts im Warenkorb.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.qty}× {item.name}
                </span>
                <span>CHF {(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>CHF {total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <Button
        className="w-full"
        onClick={handleBestellen}
        disabled={cart.length === 0 || !tisch}
      >
        Mit TWINT bezahlen (Demo)
      </Button>
    </div>
  );
}
