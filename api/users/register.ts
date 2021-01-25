import { NowRequest, NowResponse } from "@vercel/node";
import { isValid, verifyMessage } from "../../utils";
import { getModel } from "../../utils/mongo";

export default async (req: NowRequest, res: NowResponse): Promise<NowResponse> => {
  const { address, username, signature } = req.body;

  const { valid, message } = await isValid(username);
  if (!valid && message) {
    return res.status(400).json({ error: { message } });
  }

  const signedAddress = verifyMessage(username, signature);
  if (address !== signedAddress) {
    return res.status(400).json({ error: { message: "Invalid signature." } });
  }

  const userModel = await getModel("User");
  const user = await new userModel({
    address,
    username,
    created_at: Date.now(),
    updated_at: null,
  }).save();

  return res.status(201).json(user);
};
