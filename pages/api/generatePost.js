import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Configuration, OpenAIApi } from "openai";
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function handler(req, res) {
  const { user } = await getSession(req, res);
  const client = await clientPromise;
  const db = client.db("BlogStandard");
  const userProfile = await db.collection("users").findOne({
    auth0Id: user.sub,
  });

  if (!userProfile?.availableTokens) {
    res.status(401).json({
      error: "You don't have any tokens left. Please top up your account.",
    });
    return;
  }

  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(config);

  const { topic, keywords } = req.body;
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    temperature: 0,
    max_tokens: 3600,
    prompt: `Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following comma-separated keywords: ${keywords}.
    The content should be formatted in SEO-friendly HTML.
    The response must also include appropriate HTML title and meta description content.
    The return format must be stringified JSON in the following format:
    {
      "postContent": post content here
      "title": title goes here
      "metaDescription": meta description goes here
    }`,
  });

  await db.collection("users").updateOne(
    {
      auth0Id: user.sub,
    },
    {
      $inc: {
        availableTokens: -1,
      },
    }
  );

  const parsed = JSON.parse(
    response.data.choices[0]?.text.split("\n").join("")
  );
  const post = await db.collection("posts").insertOne({
    postContent: parsed?.postContent,
    title: parsed?.title,
    metaDescription: parsed?.metaDescription,
    topic,
    keywords,
    userId: userProfile._id,
    createdAt: new Date(),
  });

  console.log("response: ", post);
  res.status(200).json({
    postId: post.insertedId,
  });
});
