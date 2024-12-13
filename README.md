## Application Architecture

Below is the architecture diagram for the application

![Application Architecture](architecture-image.png)


## List of APIs

The following APIs have been implemented in this project:


### Authentication
1. **auth/login** - User login.
2. **auth/google** - Login or register using Google Authentication.

### User
1. **user/register** - Register a new user.
2. **user/update** - Update user information.
3. **user** - Retrieve user details.
4. **user/daily-quota** - Get user's daily nutritional quota.
5. **user/history** - Retrieve user's activity history.
6. **user/nutrition-summary** - Get a summary of user's nutritional data.

### Food
1. **food/analyze** - Analyze food and its nutritional information.
2. **food/save-analyze** - Save the results of a food analysis.
3. **food** - Search, filter, or paginate through food items.
4. **food/:id** - Retrieve detailed information about a specific food item.
5. **food/save** - Save a food item.
6. **food/recommendation** - Get food recommendations.
7. **food/news** - Fetch the latest food-related news.

### Point
1. **point/gift-list** - Retrieve a list of available gifts.

=======
1. **GET /users** - Retrieve a list of users.
2. **POST /users** - Add a new user.
3. **PUT /users/:id** - Update user information by ID.
4. **DELETE /users/:id** - Remove a user by ID.
5. **GET /health** - Check the application's health status.

(Expand the list as needed with additional endpoints.)


## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
