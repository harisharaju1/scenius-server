import { Updoot } from "../entities/Updoot";
import DataLoader from "dataloader";
//[{postId:5, userId:10},{},{},{}]
//[{postId:5, userId:10, value:1},{},{},{}]
export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(keys as any);
      const updootIdsToUpdoot: Record<string, Updoot> = {};
      updoots.forEach((u) => {
        updootIdsToUpdoot[`${u.userId}|${u.postId}`] = u;
      });
      const sortedUpdoots = keys.map(
        (key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]
      );
      // console.log("sortedUpdoots" + sortedUpdoots);
      return sortedUpdoots;
    }
  );
