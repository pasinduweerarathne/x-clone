# X Clone Database — Relationships Guide

This document explains how the models in `schema.prisma` relate to each other, with practical examples for each relationship.

Database: **MySQL** (`x_clone_db`)

---

## Models Overview

- **User** — an account
- **Post** — a tweet/post (also used for reposts and comments)
- **Like** — a user liking a post
- **SavedPosts** — a user bookmarking a post
- **Follow** — a user following another user

---

## 1. User ↔ Post (One-to-Many)

A **User** can create many **Posts**, but each **Post** belongs to exactly one **User**.

```prisma
model User {
  posts Post[]
}

model Post {
  user   User   @relation(fields: [userId], references: [id])
  userId String
}
```

**Example:**

User `Lama Dev` (id: `user_1`) creates 3 posts. Each of those posts has `userId = "user_1"`, but `User.posts` returns all 3 at once.

```ts
const userWithPosts = await prisma.user.findUnique({
  where: { id: "user_1" },
  include: { posts: true },
});
// userWithPosts.posts => [Post, Post, Post]
```

---

## 2. Post ↔ Post — Reposts (Self-Relation, One-to-Many)

A **Post** can be reposted many times, and a repost points back to exactly one original post. This is a **self-relation** — `Post` referencing itself — named `"RePosts"`.

```prisma
model Post {
  rePostId Int?
  rePost   Post?  @relation("RePosts", fields: [rePostId], references: [id])
  rePosts  Post[] @relation("RePosts")
}
```

**Example:**

- Original post: `id: 10`, `desc: "Hello world"`
- Repost: `id: 25`, `rePostId: 10`, `desc: null` (usually empty — it's just a repost)

```ts
// Get the original post that #25 reposted
const repost = await prisma.post.findUnique({
  where: { id: 25 },
  include: { rePost: true },
});
// repost.rePost => { id: 10, desc: "Hello world", ... }

// Get all reposts of post #10
const original = await prisma.post.findUnique({
  where: { id: 10 },
  include: { rePosts: true },
});
// original.rePosts => [{ id: 25, ... }, { id: 31, ... }]
```

---

## 3. Post ↔ Post — Comments (Self-Relation, One-to-Many)

Similarly, a **Post** can have many **comments**, and each comment is itself a `Post` that points to a `parentPost`. This self-relation is named `"PostComments"`.

```prisma
model Post {
  parentPostId Int?
  parentPost   Post?  @relation("PostComments", fields: [parentPostId], references: [id])
  comments     Post[] @relation("PostComments")
}
```

**Example:**

- Parent post: `id: 10`, `desc: "Hello world"`
- Comment: `id: 40`, `parentPostId: 10`, `desc: "Nice post!"`

```ts
// Get all comments on post #10
const postWithComments = await prisma.post.findUnique({
  where: { id: 10 },
  include: { comments: true },
});
// postWithComments.comments => [{ id: 40, desc: "Nice post!", ... }]

// Get the parent post that comment #40 belongs to
const comment = await prisma.post.findUnique({
  where: { id: 40 },
  include: { parentPost: true },
});
// comment.parentPost => { id: 10, desc: "Hello world", ... }
```

> **Note:** Both reposts and comments reuse the same `Post` model instead of separate tables. `rePostId` vs `parentPostId` is what distinguishes "this is a repost of X" from "this is a comment on X."

---

## 4. User ↔ Post — Likes (Many-to-Many via join table)

A **User** can like many **Posts**, and a **Post** can be liked by many **Users**. Since MySQL relational tables need an explicit join table for many-to-many with extra data (like `createdAt`), the `Like` model sits in between.

```prisma
model Like {
  userId String
  postId Int

  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])
}
```

**Example:**

User `user_1` likes post `10`:

```ts
await prisma.like.create({
  data: { userId: "user_1", postId: 10 },
});
```

Get all posts a user liked:

```ts
const userLikes = await prisma.like.findMany({
  where: { userId: "user_1" },
  include: { post: true },
});
```

Get all users who liked a post:

```ts
const postLikes = await prisma.like.findMany({
  where: { postId: 10 },
  include: { user: true },
});
```

---

## 5. User ↔ Post — Saved Posts / Bookmarks (Many-to-Many via join table)

Works exactly like `Like`, but represents bookmarking a post instead of liking it.

```prisma
model SavedPosts {
  userId String
  postId Int

  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])
}
```

**Example:**

```ts
// Save (bookmark) a post
await prisma.savedPosts.create({
  data: { userId: "user_1", postId: 10 },
});

// Get all posts a user has saved
const saved = await prisma.savedPosts.findMany({
  where: { userId: "user_1" },
  include: { post: true },
});
```

---

## 6. User ↔ User — Follow (Many-to-Many, Self-Relation via join table)

A **User** can follow many other **Users**, and can be followed by many **Users**. Since both sides of the relationship are the _same_ model (`User`), this uses **two named relations** (`"UserFollowers"` and `"UserFollowings"`) so Prisma can tell "who is following" apart from "who is being followed."

```prisma
model User {
  followers  Follow[] @relation("UserFollowers")
  followings Follow[] @relation("UserFollowings")
}

model Follow {
  follwerId   String
  followingId String

  follwer   User @relation("UserFollowers", fields: [follwerId], references: [id])
  following User @relation("UserFollowings", fields: [followingId], references: [id])
}
```

**How to read it:**

- `Follow.follwer` = the person doing the following
- `Follow.following` = the person being followed
- `User.followers` = all `Follow` rows where **this user is being followed** (their followers)
- `User.followings` = all `Follow` rows where **this user is doing the following** (who they follow)

**Example:**

`user_1` follows `user_2`:

```ts
await prisma.follow.create({
  data: { follwerId: "user_1", followingId: "user_2" },
});
```

Get everyone `user_1` follows:

```ts
const following = await prisma.user.findUnique({
  where: { id: "user_1" },
  include: { followings: { include: { following: true } } },
});
// following.followings => [{ following: { id: "user_2", username: "..." } }]
```

Get everyone following `user_2`:

```ts
const followers = await prisma.user.findUnique({
  where: { id: "user_2" },
  include: { followers: { include: { follwer: true } } },
});
// followers.followers => [{ follwer: { id: "user_1", username: "..." } }]
```

> **Typo note:** the field is spelled `follwer` / `follwerId` (missing the "o") in the schema — this is consistent throughout, so just make sure you use the same spelling in your queries or it'll throw a "field does not exist" error.

---

## Relationship Summary Table

| Relation    | Type                | Models     | Join Table   | Notes                                  |
| ----------- | ------------------- | ---------- | ------------ | -------------------------------------- |
| User → Post | 1-to-Many           | User, Post | —            | direct FK (`userId`)                   |
| Post → Post | 1-to-Many (self)    | Post, Post | —            | `"RePosts"` relation                   |
| Post → Post | 1-to-Many (self)    | Post, Post | —            | `"PostComments"` relation              |
| User ↔ Post | Many-to-Many        | User, Post | `Like`       | tracks who liked what                  |
| User ↔ Post | Many-to-Many        | User, Post | `SavedPosts` | tracks who bookmarked what             |
| User ↔ User | Many-to-Many (self) | User, User | `Follow`     | `"UserFollowers"` / `"UserFollowings"` |
