import { faker } from "@faker-js/faker";

export const config = {
  runtime: "edge",
};

export default async function handler(_) {
  const encoder = new TextEncoder();

  const numWords = Math.floor(Math.random() * 5) + 1;

  const min = 10;
  const max = 200;
  const randomNum = Math.floor(Math.random() * (max - min + 1) + min);

  const customReadable = new ReadableStream({
    start(controller) {
      let count = 0;
      const generateData = () => {
        if (count < 20) {
          const fakeData = faker.lorem.words(numWords);
          controller.enqueue(encoder.encode(fakeData));
          count++;
          setTimeout(generateData, randomNum);
        } else {
          controller.close();
        }
      };
      generateData();
    },
  });

  return new Response(customReadable, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
