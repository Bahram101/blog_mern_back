import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec();
    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Не удалось вывести данные",
    });
  }
};

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();
    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);
    res.json(tags);
  } catch (error) {
    res.status(500).json({
      message: "Не удалось вывести данные",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;
    // const post = await PostModel.findById(postId);
    // res.json(post)

    PostModel.findByIdAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      { returnDocument: "after" },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Не удалось вернуть статью",
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }

        res.json(doc);
      }
    ).populate("user");
  } catch (error) {
    res.status(500).json({ message: "Не удалось получить одну статью" });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      imageUrl: req.body.imageUrl,
      title: req.body.title,
      tags: req.body.tags.split(','),
      text: req.body.text,
      user: req.userId,
    });
    const post = await doc.save();
    res.json(post);
  } catch (error) {
    res.json({
      message: "Не удалось создать статью",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Не удалось удалить статью",
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }

        res.json({ message: true });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Не удалось получить одну статью" });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        imageUrl: req.body.imageUrl,
        title: req.body.title,
        tags: req.body.tags.split(','),
        text: req.body.text,
        user: req.userId,
      }
    );
    res.json({ message: true });
  } catch (error) {
    res.json({
      message: "Не удалось обновить статью",
    });
  }
};
