/**
 * Created by Cooper on 2022/04/05.
 */
import { Container, Inject, Injectable, Use } from '../src';

describe('helper.Container', () => {
  it('value equal', () => {
    Container.set('hello', 'world');
    expect(Container.get('hello')).toBe('world');
  });

  it('object equal', () => {
    const obj = { one: 1, two: 2 };
    Container.set('obj.demo1', obj);
    expect(Container.get('obj.demo1')).toEqual({ one: 1, two: 2 });
  });

  it('class equal', () => {
    class User {}
    let u = new User();
    Container.set(User.name, User);
    expect(Container.get(User)).toEqual(u);
  });
});

describe('helper decorator', () => {
  it('should inject params ok', function () {
    @Injectable()
    class UserService {}
    class User {
      constructor(srv: UserService) {}
    }

    const u = new User(new UserService());

    Container.set(User.name, User);
    expect(Container.get(User)).toEqual(u);
  });

  it('should inject property ok', function () {
    @Injectable()
    class UserService {}

    @Injectable()
    class User {
      @Inject() srv: UserService;
      constructor() {}
    }

    const srv = new UserService();
    expect(Container.get(User).srv).toEqual(srv);
  });
});
